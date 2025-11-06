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
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, or PDF)");
        setIsProcessing(false);
        return null;
      }

      // Check file size
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File must be less than 20MB");
        setIsProcessing(false);
        return null;
      }

      setProgress(25);

      const formData = new FormData();
      formData.append("image", file);

      toast.loading("Extracting passport data... This may take a moment");
      setProgress(40);

      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response: Response;
      try {
        response = await fetch("/api/ocr/passport", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } catch (networkError) {
        clearTimeout(timeoutId);
        setIsProcessing(false);
        setProgress(0);

        if (networkError instanceof DOMException && networkError.name === "AbortError") {
          toast.error("Request timed out. Please try with a smaller or clearer image.");
        } else {
          toast.error("Network error. Please check your connection.");
        }
        return null;
      }

      clearTimeout(timeoutId);
      setProgress(80);

      // Clone the response to create a separate readable stream
      const responseClone = response.clone();
      
      // Parse response as JSON using the clone
      let responseData: any;
      try {
        responseData = await responseClone.json();
      } catch (parseError) {
        setIsProcessing(false);
        setProgress(0);
        console.error("Failed to parse response:", parseError);
        
        // Try to get status text as fallback
        const statusText = response.statusText || `Server error ${response.status}`;
        toast.error(`Error: ${statusText}. Please try again.`);
        return null;
      }

      // Check response status
      if (!response.ok) {
        let errorMessage = responseData?.error || "Failed to process image";

        if (responseData?.code === "BILLING_NOT_ENABLED") {
          errorMessage = "Google API billing not fully enabled yet. Please wait 5-10 minutes and try again.";
        } else if (responseData?.code === "CREDENTIAL_ERROR") {
          errorMessage = "Server configuration error. Please contact support.";
        } else if (responseData?.code === "INVALID_FORMAT") {
          errorMessage = "Invalid image format. Please upload a clear JPG, PNG, or PDF.";
        } else if (responseData?.code === "TIMEOUT") {
          errorMessage = "Extraction took too long. Try a smaller image.";
        }

        console.error("OCR Error:", { status: response.status, code: responseData?.code });
        toast.error(errorMessage);
        setIsProcessing(false);
        setProgress(0);
        return null;
      }

      // Validate response
      if (!responseData?.success || !responseData?.data) {
        toast.error("Could not extract data from image");
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

      // Show confidence feedback
      if (result.confidence >= 0.7) {
        toast.success(`Extracted with ${Math.round(result.confidence * 100)}% confidence`);
      } else if (result.confidence >= 0.4) {
        toast.warning(`Low confidence (${Math.round(result.confidence * 100)}%). Please verify.`);
      } else {
        toast.info("Limited data extracted. Please review and correct.");
      }

      return result;
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      console.error("Unexpected OCR error:", error);
      toast.error("Failed to process image. Please try again.");
      return null;
    }
  };

  return { extractPassportData, isProcessing: isProcessing || progress > 0, progress };
}
