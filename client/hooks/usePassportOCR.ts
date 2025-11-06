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

  const extractPassportData = async (file: File): Promise<ExtractedPassportData | null> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Dynamically import Tesseract to avoid bundle issues
      const Tesseract = (await import("tesseract.js")).default;

      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      if (!text || text.trim().length < 10) {
        toast.error("Could not extract text from passport. Please check image quality.");
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
      toast.error("Failed to process passport image. Please try a clearer image or enter data manually.");
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
