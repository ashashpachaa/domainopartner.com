import { useState, useCallback, useEffect } from "react";

export interface CompanyValidationResult {
  isAvailable: boolean | null;
  totalResults: number;
  exactMatch: {
    company_number?: string;
    title?: string;
    company_status?: string;
    date_of_creation?: string;
  } | null;
  similarMatch: {
    company_number?: string;
    title?: string;
    company_status?: string;
    date_of_creation?: string;
  } | null;
  results: any[];
  error?: string;
}

export function useCompanyNameValidation() {
  const [validationResult, setValidationResult] = useState<CompanyValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidatedName, setLastValidatedName] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validateCompanyName = useCallback(
    async (companyName: string) => {
      if (!companyName || companyName.trim().length < 2) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);

      try {
        const response = await fetch(
          `/api/companies-house/search?companyName=${encodeURIComponent(companyName)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setValidationResult({
            isAvailable: null,
            totalResults: 0,
            exactMatch: null,
            similarMatch: null,
            results: [],
            error: errorData.error || "Failed to validate company name",
          });
          setIsValidating(false);
          return;
        }

        const data = await response.json();
        setValidationResult(data);
        setLastValidatedName(companyName);
      } catch (error) {
        console.error("Company name validation error:", error);
        setValidationResult({
          isAvailable: null,
          totalResults: 0,
          exactMatch: null,
          similarMatch: null,
          results: [],
          error: "Failed to check company availability",
        });
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const checkCompanyName = useCallback(
    (companyName: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (!companyName || companyName.trim().length < 2) {
        setValidationResult(null);
        return;
      }

      const timer = setTimeout(() => {
        validateCompanyName(companyName);
      }, 500);

      setDebounceTimer(timer);
    },
    [debounceTimer, validateCompanyName]
  );

  return {
    validationResult,
    isValidating,
    lastValidatedName,
    checkCompanyName,
    validateCompanyName,
  };
}
