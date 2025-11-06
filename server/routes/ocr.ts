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

    // Validate file type - images only
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(req.file.mimetype) && !req.file.mimetype.startsWith("image/")) {
      res.status(400).json({
        success: false,
        error: "Invalid file type. Please upload a JPG or PNG image file.",
        code: "INVALID_FORMAT"
      });
      return;
    }

    // Check file size (max 20MB)
    if (req.file.size > 20 * 1024 * 1024) {
      res.status(400).json({ error: "File size exceeds 20MB limit" });
      return;
    }

    // Initialize Vision API client
    const client = getVisionClient();

    let processedBuffer = req.file.buffer;

    // Optimize image if it's an image file (compress for faster processing)
    if (req.file.mimetype.startsWith("image/")) {
      try {
        // Compress image while maintaining quality for OCR
        processedBuffer = await sharp(req.file.buffer)
          .resize(2000, 2000, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } catch (optimizeError) {
        console.warn("Image optimization failed, using original:", optimizeError);
        // Continue with original buffer if optimization fails
      }
    }

    // Prepare the image data
    const base64Image = processedBuffer.toString("base64");

    // Call Google Vision API with DOCUMENT_TEXT_DETECTION for better OCR
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
        error: "Could not extract text from the file. Ensure the image is clear and readable.",
      });
      return;
    }

    // Get the full text from the first annotation (contains all text)
    const fullText = textAnnotations[0]?.description || "";

    if (!fullText || fullText.trim().length < 5) {
      res.status(400).json({
        error: "Could not find readable text. Try uploading a clearer image or different scan.",
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : typeof error;

    console.error("OCR Processing Error:", {
      message: errorMessage,
      type: errorType,
      timestamp: new Date().toISOString(),
    });

    let statusCode = 500;
    let errorResponse = {
      success: false,
      error: "Failed to process image. Please try again.",
      code: "PROCESSING_ERROR",
    };

    if (error instanceof Error) {
      // Check for specific Google API errors
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("permission")) {
        errorResponse = {
          success: false,
          error: "Google Vision API permission issue. Please ensure billing is enabled and wait 5-10 minutes for changes to propagate.",
          code: "BILLING_NOT_ENABLED",
        };
      } else if (errorMessage.includes("UNAUTHENTICATED") || errorMessage.includes("credentials")) {
        errorResponse = {
          success: false,
          error: "Server configuration error: Google credentials not properly configured.",
          code: "CREDENTIAL_ERROR",
        };
      } else if (errorMessage.includes("timeout") || errorMessage.includes("DEADLINE")) {
        statusCode = 504;
        errorResponse = {
          success: false,
          error: "Request timed out. Please try with a smaller or clearer image.",
          code: "TIMEOUT",
        };
      } else if (errorMessage.includes("INVALID_ARGUMENT")) {
        statusCode = 400;
        errorResponse = {
          success: false,
          error: "Invalid image format. Please ensure the file is a clear JPG, PNG, or PDF.",
          code: "INVALID_FORMAT",
        };
      }
    }

    res.status(statusCode).json(errorResponse);
  }
}
