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

  let confidenceScore = 0;

  // Common label words to filter out
  const labelWords = new Set(["Full", "Name", "Given", "Family", "Surname", "First", "Last", "Date", "Of", "Birth", "Sex", "M", "F", "Nationality", "Passport", "Number", "Valid", "Until"]);

  // === DATE OF BIRTH EXTRACTION ===
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      try {
        let day, month, year;
        if (pattern === datePatterns[0]) {
          [, day, month, year] = matches;
        } else {
          [, year, month, day] = matches;
        }

        day = String(day).padStart(2, "0");
        month = String(month).padStart(2, "0");

        // Validate date ranges
        const monthNum = parseInt(month);
        const dayNum = parseInt(day);
        const yearNum = parseInt(year);

        if (monthNum > 0 && monthNum <= 12 && dayNum > 0 && dayNum <= 31 && yearNum > 1900 && yearNum < 2100) {
          result.dateOfBirth = `${year}-${month}-${day}`;
          confidenceScore += 0.25;
          break;
        }
      } catch (e) {
        // skip invalid date
      }
    }
  }

  // === NATIONALITY EXTRACTION ===
  // Look for words ending in "ian" or full nationality names
  const nationalityMatches = text.match(/\b[A-Z][a-z]{2,}ian\b/g) || [];
  if (nationalityMatches.length > 0) {
    result.nationality = nationalityMatches[0]; // "Egyptian", "Indian", etc.
    confidenceScore += 0.25;
  } else {
    // Try pattern-based extraction
    const nationalityPattern = /(?:Nationality|National|Citizenship)[:\s]+([A-Z][a-z]+)/i;
    const match = text.match(nationalityPattern);
    if (match && match[1] && !labelWords.has(match[1])) {
      result.nationality = match[1];
      confidenceScore += 0.25;
    }
  }

  // === NAME EXTRACTION (MOST CRITICAL) ===
  // Strategy: Look for sequences of words that look like names
  // Names should be:
  // 1. Capital letter words
  // 2. NOT be common labels
  // 3. Appear after passport headers or at the beginning
  // 4. Be reasonably sized (typical names are 2-50 chars)

  // Extract all capital letter word sequences
  const allCapitalSequences = text.match(/\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\b/g) || [];

  // Filter for likely names
  const candidateNames = allCapitalSequences
    .filter((seq) => {
      // Skip if too short or too long
      if (seq.length < 4 || seq.length > 60) return false;
      
      // Skip if contains label words
      if (labelWords.has(seq)) return false;
      
      // Skip document headers
      if (seq.includes("PASSPORT") || seq.includes("REPUBLIC") || seq.includes("UNITED") || seq.includes("KINGDOM")) return false;
      
      // Skip numbers
      if (/\d/.test(seq)) return false;
      
      // Must have at least 2 words (first + last name) or be a known single name pattern
      const words = seq.split(/\s+/);
      if (words.length < 2) return false;
      
      // Each word should be reasonably long (not just initials)
      if (words.some(w => w.length === 1)) return false;
      
      return true;
    })
    .slice(0, 5); // Limit to first 5 candidates to avoid too much processing

  // Use the first good candidate as the name
  if (candidateNames.length > 0) {
    const fullName = candidateNames[0];
    const nameParts = fullName.split(/\s+/);
    
    if (nameParts.length >= 2) {
      result.firstName = nameParts[0];
      result.lastName = nameParts.slice(1).join(" ");
      confidenceScore += 0.25;
    } else if (nameParts.length === 1) {
      result.firstName = nameParts[0];
      confidenceScore += 0.15; // Lower confidence if only first name
    }
  }

  // === CONFIDENCE ADJUSTMENT ===
  // Penalize if extracted data looks suspicious
  const suspiciousPatterns = ["PASSPORT", "REPUBLIC", "UNITED", "KINGDOM", "AND", "THE", "DOCUMENT"];
  
  if (result.firstName && suspiciousPatterns.some(p => result.firstName!.includes(p))) {
    confidenceScore = Math.max(0, confidenceScore - 0.3);
  }
  
  if (result.lastName && suspiciousPatterns.some(p => result.lastName!.includes(p))) {
    confidenceScore = Math.max(0, confidenceScore - 0.3);
  }

  // Validate extracted names
  if (result.firstName && result.firstName.length > 30) result.firstName = undefined;
  if (result.lastName && result.lastName.length > 50) result.lastName = undefined;
  if (result.nationality && result.nationality.length > 30) result.nationality = undefined;

  result.confidence = Math.min(1, Math.max(0, confidenceScore));

  return result;
}

export async function handleOCR(req: Request, res: Response) {
  try {
    // Check if file is provided
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image file provided" });
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
      res.status(400).json({ 
        success: false,
        error: "File size exceeds 20MB limit",
        code: "SIZE_LIMIT"
      });
      return;
    }

    // Initialize Vision API client
    const client = getVisionClient();

    let processedBuffer = req.file.buffer;

    // Optimize image - compress for faster processing
    if (req.file.mimetype.startsWith("image/")) {
      try {
        processedBuffer = await sharp(req.file.buffer)
          .resize(2000, 2000, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } catch (optimizeError) {
        console.warn("Image optimization failed, using original:", optimizeError);
      }
    }

    // Prepare image data
    const base64Image = processedBuffer.toString("base64");

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
        success: false,
        error: "Could not extract text from the file. Ensure the image is clear and readable.",
        code: "NO_TEXT_DETECTED"
      });
      return;
    }

    // Get full text from first annotation
    const fullText = textAnnotations[0]?.description || "";

    if (!fullText || fullText.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: "Could not find readable text. Try uploading a clearer image.",
        code: "INSUFFICIENT_TEXT"
      });
      return;
    }

    // Parse the extracted text
    const extractedData = parsePassportText(fullText);

    // Return the extracted data
    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("OCR Processing Error:", {
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    let statusCode = 500;
    let errorResponse = {
      success: false,
      error: "Failed to process image. Please try again.",
      code: "PROCESSING_ERROR",
    };

    if (error instanceof Error) {
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("permission")) {
        errorResponse = {
          success: false,
          error: "Google Vision API permission issue. Please ensure billing is enabled.",
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
      }
    }

    res.status(statusCode).json(errorResponse);
  }
}
