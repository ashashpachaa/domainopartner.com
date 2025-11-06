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

  // Extract names - look for name fields after specific markers
  // First, try to find explicit name patterns (e.g., "Name: JOHN DOE" or "Given Names: JOHN")
  const explicitNamePatterns = [
    /Surname[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|$)/i,
    /Given Names?[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|$)/i,
    /Family Name[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|$)/i,
    /First Name[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|$)/i,
  ];

  const extractedNames: string[] = [];
  for (const pattern of explicitNamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 0 && !name.includes("PASSPORT") && !name.includes("REPUBLIC") && !name.includes("UNITED")) {
        extractedNames.push(name);
        nameMatchConfidence += 0.25;
      }
    }
  }

  // If we found explicit names, use them
  if (extractedNames.length === 2) {
    result.firstName = extractedNames[0];
    result.lastName = extractedNames[1];
  } else if (extractedNames.length === 1) {
    const parts = extractedNames[0].split(/\s+/);
    if (parts.length >= 2) {
      result.firstName = parts[0];
      result.lastName = parts.slice(1).join(" ");
    } else {
      result.firstName = extractedNames[0];
    }
  }

  // Extract nationality (look for common patterns)
  const nationalityPatterns = [
    /nationality[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|[A-Z]|$)/i,
    /national[ity]*[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|[A-Z]|$)/i,
    /citizenship[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|[A-Z]|$)/i,
    /[A-Z][a-z]+ian$/im, // Match words ending in "ian" like "Egyptian", "Indian", etc.
  ];

  for (const pattern of nationalityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const nationality = match[1].trim();
      if (nationality.length > 0 && !nationality.includes("PASSPORT")) {
        result.nationality = nationality.replace(/[^A-Za-z\s]/g, "").trim();
        if (result.nationality.length > 0) break;
      }
    }
  }

  // If names still not found, look for name patterns in a safer way
  if (!result.firstName || !result.lastName) {
    const safeCapitalSequences = text.match(/(?:^|\n)([A-Z][a-z]+)\s+([A-Z][a-z\s]+?)(?=\n|<|$)/gm);
    if (safeCapitalSequences && safeCapitalSequences.length > 0) {
      for (const seq of safeCapitalSequences) {
        const parts = seq.trim().split(/\s+/);
        if (parts.length >= 2) {
          const candidate = `${parts[0]} ${parts.slice(1).join(" ")}`;
          if (!candidate.includes("PASSPORT") && !candidate.includes("REPUBLIC") && !candidate.includes("UNITED") && candidate.length < 50) {
            result.firstName = parts[0];
            result.lastName = parts.slice(1).join(" ");
            nameMatchConfidence += 0.15;
            break;
          }
        }
      }
    }
  }

  // Calculate confidence score
  let confidenceScore = 0;

  // Scoring for each field
  if (result.firstName && result.firstName.length > 1 && result.firstName.length < 30) confidenceScore += 0.25;
  if (result.lastName && result.lastName.length > 1 && result.lastName.length < 50) confidenceScore += 0.25;
  if (result.dateOfBirth) confidenceScore += 0.25;
  if (result.nationality && result.nationality.length > 1 && result.nationality.length < 30) confidenceScore += 0.25;

  // Bonus for date pattern confidence
  if (datePatternMatches > 0) confidenceScore += 0.05;

  // Bonus for name field pattern matching
  if (nameMatchConfidence > 0) confidenceScore += Math.min(0.05, nameMatchConfidence);

  // Penalize if name looks suspicious (too long, contains numbers, or weird characters)
  if (result.firstName && (result.firstName.includes("PASSPORT") || result.firstName.includes("REPUBLIC") || result.firstName.includes("UNITED"))) {
    confidenceScore = Math.max(0, confidenceScore - 0.3);
  }
  if (result.lastName && (result.lastName.includes("PASSPORT") || result.lastName.includes("REPUBLIC") || result.lastName.includes("UNITED"))) {
    confidenceScore = Math.max(0, confidenceScore - 0.3);
  }

  result.confidence = Math.min(1, Math.max(0, confidenceScore));

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
