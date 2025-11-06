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
    setProgress(20);

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG)");
        setIsProcessing(false);
        return null;
      }

      // Check file size (max 10MB for OCR)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file must be less than 10MB");
        setIsProcessing(false);
        return null;
      }

      setProgress(40);

      // Create FormData to send the image to the backend
      const formData = new FormData();
      formData.append("image", file);

      setProgress(60);

      // Call the backend OCR endpoint
      const response = await fetch("/api/ocr/passport", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to process passport image";
        toast.error(errorMessage);
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        toast.error("Could not extract passport data from the image");
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      setProgress(100);
      setIsProcessing(false);
      setProgress(0);

      // Show success toast if confidence is high
      if (result.data.confidence >= 0.6) {
        toast.success(`Passport data extracted with ${Math.round(result.data.confidence * 100)}% confidence`);
      } else if (result.data.confidence > 0) {
        toast.warning(`Data extracted with low confidence (${Math.round(result.data.confidence * 100)}%). Please verify the information.`);
      }

      return result.data;
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
      setProgress(0);

      // Provide helpful error message
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error("Failed to process passport image. Please try again.");
        }
      } else {
        toast.error("Failed to process passport image. Please try again.");
      }

      return null;
    }
  };

  return { extractPassportData, isProcessing: isProcessing || progress > 0, progress };
}
