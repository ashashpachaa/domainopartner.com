import { useState } from "react";
import { toast } from "sonner";

export interface ExtractedPassportData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  confidence: number;
}

export function usePassportOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const convertImageToCanvas = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const extractPassportData = async (file: File): Promise<ExtractedPassportData | null> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, or PDF)");
        setIsProcessing(false);
        return null;
      }

      // Check file size (max 10MB for OCR)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file must be less than 10MB");
        setIsProcessing(false);
        return null;
      }

      // Dynamically import Tesseract to avoid bundle issues
      const Tesseract = (await import("tesseract.js")).default;

      let imageData: string | HTMLCanvasElement | File;

      // Try different approaches based on file type
      if (file.type === "application/pdf") {
        // PDFs need special handling - use the file directly
        imageData = file;
      } else {
        // For images, convert through Canvas to ensure compatibility
        try {
          imageData = await convertImageToCanvas(file);
        } catch (canvasError) {
          console.warn("Canvas conversion failed, trying direct file approach:", canvasError);
          // Fallback: try to use file directly
          imageData = file;
        }
      }

      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing") {
            setProgress(Math.round(m.progress * 100));
          } else if (m.status === "done") {
            setProgress(100);
          }
        },
      });

      const text = result.data.text;
      
      if (!text || text.trim().length < 10) {
        toast.error("Could not extract text from passport image. Please ensure the image is clear and readable.");
        setIsProcessing(false);
        return null;
      }

      const extractedData = parsePassportText(text);
      setIsProcessing(false);
      setProgress(0);

      return extractedData;
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
      setProgress(0);

      // Provide helpful error message
      if (error instanceof Error) {
        if (error.message.includes("attempting to read image")) {
          toast.error("Image format not supported. Please try a clearer JPG or PNG image of the passport.");
        } else {
          toast.error("OCR processing failed. Please enter data manually or try another image.");
        }
      } else {
        toast.error("Failed to process passport image. Please try a clearer image or enter data manually.");
      }
      
      return null;
    }
  };

  const parsePassportText = (text: string): ExtractedPassportData => {
    const lines = text.split("\n").map((line) => line.trim());
    const result: ExtractedPassportData = { confidence: 0 };

    let datePatternMatches = 0;
    let nameMatchConfidence = 0;

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

          day = day.padStart(2, "0");
          month = month.padStart(2, "0");

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
  };

  return { extractPassportData, isProcessing: isProcessing || progress > 0, progress };
}
