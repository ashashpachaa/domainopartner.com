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

      let response: Response;
      try {
        response = await fetch("/api/ocr/passport", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        setIsProcessing(false);
        setProgress(0);

        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          toast.error("Request timed out. The file may be too large or the service is slow. Try a clearer image or smaller file.");
        } else if (fetchError instanceof Error && fetchError.message.includes("Failed to fetch")) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error("Failed to connect to OCR service. Please try again.");
        }
        return null;
      }

      clearTimeout(timeoutId);
      setProgress(80);

      // Parse response body only once - critical to avoid stream errors
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (parseError) {
        setIsProcessing(false);
        setProgress(0);
        console.error("Failed to parse response:", parseError);
        toast.error("Server returned invalid response. Please try again.");
        return null;
      }

      // Now check response status after we've successfully parsed it
      if (!response.ok) {
        let errorMessage = responseData?.error || "Failed to process passport image";

        // Map error codes to user-friendly messages
        if (responseData?.code === "BILLING_NOT_ENABLED") {
          errorMessage =
            "Google API not ready yet. Please wait 5-10 minutes after enabling billing and try again.";
        } else if (responseData?.code === "CREDENTIAL_ERROR") {
          errorMessage = "Server configuration error. Please contact support.";
        } else if (responseData?.code === "INVALID_FORMAT") {
          errorMessage = "Invalid image format. Please upload a clear JPG, PNG, or PDF of the passport.";
        } else if (responseData?.code === "TIMEOUT") {
          errorMessage = "Extraction took too long. Please try with a clearer or smaller image.";
        }

        console.error("OCR Error Details:", {
          status: response.status,
          code: responseData?.code,
          message: responseData?.error,
        });

        toast.error(errorMessage);
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      // Validate response structure
      if (!responseData?.success || !responseData?.data) {
        toast.error("Could not extract passport data from the image");
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      setProgress(90);
      const result = responseData.data as ExtractedPassportData;

      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);

      // Show success toast if confidence is high
      if (result.confidence >= 0.7) {
        toast.success(`Extracted with ${Math.round(result.confidence * 100)}% confidence`);
      } else if (result.confidence >= 0.4) {
        toast.warning(`Low confidence (${Math.round(result.confidence * 100)}%). Please verify data.`);
      } else {
        toast.info("Limited data extracted. Please review and correct manually.");
      }

      return result;
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      console.error("OCR Processing Error:", error);
      toast.error("Failed to process image. Please try again.");
      return null;
    }
  };

  return { extractPassportData, isProcessing: isProcessing || progress > 0, progress };
}
