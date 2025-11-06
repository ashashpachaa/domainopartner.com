import { Request, Response } from "express";
import vision from "@google-cloud/vision";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

interface ExtractedPassportData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  confidence: number;
}

// Initialize Vision client with credentials from environment
function getVisionClient() {
  const credentials = process.env.GOOGLE_VISION_CREDENTIALS;

  if (!credentials) {
    throw new Error("Google Vision API credentials not configured");
  }

  const credentialsPath = path.join(process.cwd(), ".credentials", "vision.json");

  if (!fs.existsSync(path.dirname(credentialsPath))) {
    fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  }

  if (!fs.existsSync(credentialsPath)) {
    fs.writeFileSync(credentialsPath, credentials);
  }

  return new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath,
  });
}

function parsePassportText(text: string): ExtractedPassportData {
  const result: ExtractedPassportData = { confidence: 0 };

  let datePatternMatches = 0;
  let nameMatchConfidence = 0;

  const lines = text.split("\n").map((line) => line.trim());
  const lines_lower = text.toLowerCase();

  // Extract date of birth (common patterns: DD/MM/YYYY, DD-MM-YYYY, DDMMMYYYY)
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(\d{1,2})?(\d{4})/i,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      try {
        let day, month, year;
        if (pattern === datePatterns[0]) {
          [, day, month, year] = matches;
        } else if (pattern === datePatterns[2]) {
          [, year, month, day] = matches;
        } else {
          continue;
        }

        day = String(day).padStart(2, "0");
        month = String(month).padStart(2, "0");

        if (parseInt(month) > 0 && parseInt(month) <= 12 && parseInt(day) > 0 && parseInt(day) <= 31) {
          result.dateOfBirth = `${year}-${month}-${day}`;
          datePatternMatches++;
        }
      } catch (e) {
        // skip invalid date
      }
    }
  }

  // Extract names (first name and last name, typically after specific passport markers)
  const nameKeywords = ["name", "given name", "surname", "family name"];
  for (const keyword of nameKeywords) {
    const index = lines_lower.indexOf(keyword);
    if (index !== -1 && index < lines.length - 1) {
      const nextLine = lines[index + 1]?.trim() || "";
      if (nextLine && nextLine.length > 0 && /^[A-Z\s]+$/.test(nextLine)) {
        const parts = nextLine.split(/\s+/);
        if (parts.length >= 2) {
          result.firstName = parts[0];
          result.lastName = parts.slice(1).join(" ");
          nameMatchConfidence += 0.3;
        } else if (parts.length === 1 && keyword === "given name") {
          result.firstName = parts[0];
          nameMatchConfidence += 0.2;
        }
      }
    }
  }

  // Extract nationality (look for common patterns)
  const nationalityPatterns = [
    /nationality[:\s]+([A-Z][a-z]+)/i,
    /national[ity]*[:\s]+([A-Z][a-z]+)/i,
    /citizenship[:\s]+([A-Z][a-z]+)/i,
  ];

  for (const pattern of nationalityPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.nationality = match[1];
      break;
    }
  }

  // If names not found through keywords, try to extract from capital letter sequences
  if (!result.firstName || !result.lastName) {
    const capitalSequences = text.match(/\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/g) || [];
    for (const seq of capitalSequences) {
      if (seq.length > 3 && !seq.includes("PASSPORT")) {
        const parts = seq.split(/\s+/);
        if (parts.length >= 2 && !result.firstName) {
          result.firstName = parts[0];
          result.lastName = parts.slice(1).join(" ");
          nameMatchConfidence += 0.2;
          break;
        } else if (parts.length === 1 && !result.firstName) {
          result.firstName = seq;
          nameMatchConfidence += 0.1;
        }
      }
    }
  }

  // Calculate confidence score
  let confidenceScore = 0;
  if (result.firstName) confidenceScore += 0.25;
  if (result.lastName) confidenceScore += 0.25;
  if (result.dateOfBirth) confidenceScore += 0.25;
  if (result.nationality) confidenceScore += 0.25;
  if (datePatternMatches > 0) confidenceScore += 0.1;
  if (nameMatchConfidence > 0) confidenceScore += Math.min(0.1, nameMatchConfidence);

  result.confidence = Math.min(1, confidenceScore);

  return result;
}

export async function handleOCR(req: Request, res: Response) {
  try {
    // Check if file is provided
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Invalid file type. Please upload an image file." });
      return;
    }

    // Check file size (max 10MB for OCR)
    if (req.file.size > 10 * 1024 * 1024) {
      res.status(400).json({ error: "File size exceeds 10MB limit" });
      return;
    }

    // Initialize Vision API client
    const client = getVisionClient();

    // Prepare the image data
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString("base64");

    // Call Google Vision API
    const request = {
      image: {
        content: base64Image,
      },
      features: [
        {
          type: "DOCUMENT_TEXT_DETECTION",
        },
      ],
    };

    const [result] = await client.annotateImage(request);
    const textAnnotations = result.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      res.status(400).json({
        error: "Could not extract text from the image. Please ensure the image is clear and readable.",
      });
      return;
    }

    // Get the full text from the first annotation (contains all text)
    const fullText = textAnnotations[0]?.description || "";

    if (!fullText || fullText.trim().length < 10) {
      res.status(400).json({
        error: "Extracted text is too short. Please ensure the passport image is clear and complete.",
      });
      return;
    }

    // Parse the extracted text to get passport data
    const extractedData = parsePassportText(fullText);

    // Return the extracted data
    res.json({
      success: true,
      data: extractedData,
      rawText: fullText,
    });
  } catch (error) {
    console.error("OCR Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("credentials")) {
        res.status(500).json({ error: "Server configuration error: Google Vision API credentials not available" });
      } else {
        res.status(500).json({ error: `OCR processing failed: ${error.message}` });
      }
    } else {
      res.status(500).json({ error: "Failed to process image. Please try again." });
    }
  }
}
