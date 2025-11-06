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
    setProgress(10);

    try {
      // Validate file type - accept images and PDFs
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, or PDF)");
        setIsProcessing(false);
        return null;
      }

      // Check file size (max 20MB for OCR)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File must be less than 20MB");
        setIsProcessing(false);
        return null;
      }

      setProgress(25);

      // Create FormData to send the image to the backend
      const formData = new FormData();
      formData.append("image", file);

      // Show loading toast indicating processing has started
      toast.loading("Extracting passport data... This may take a moment");

      setProgress(40);

      // Call the backend OCR endpoint with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch("/api/ocr/passport", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to process passport image";
        toast.error(errorMessage);
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      const result = await response.json();
      setProgress(90);

      if (!result.success || !result.data) {
        toast.error("Could not extract passport data from the image");
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);

      // Show success toast if confidence is high
      if (result.data.confidence >= 0.7) {
        toast.success(`Extracted with ${Math.round(result.data.confidence * 100)}% confidence`);
      } else if (result.data.confidence >= 0.4) {
        toast.warning(`Low confidence (${Math.round(result.data.confidence * 100)}%). Please verify data.`);
      } else {
        toast.info("Limited data extracted. Please review and correct manually.");
      }

      return result.data;
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
      setProgress(0);

      // Provide helpful error message
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.error("Request timed out. The file may be too large or the service is slow. Try a clearer image or smaller file.");
      } else if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error("Failed to process image. Please try again.");
        }
      } else {
        toast.error("Failed to process image. Please try again.");
      }

      return null;
    }
  };

  return { extractPassportData, isProcessing: isProcessing || progress > 0, progress };
}
