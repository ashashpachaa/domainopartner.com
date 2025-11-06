import { useState, useEffect, useCallback, useRef } from "react";

export interface CompanyValidationResult {
  isAvailable: boolean | null;
  isChecking: boolean;
  error: string | null;
  exactMatch: any | null;
  results: any[];
  lastChecked: string | null;
}

export function useCompanyNameValidation() {
  const [validationResult, setValidationResult] =
    useState<CompanyValidationResult>({
      isAvailable: null,
      isChecking: false,
      error: null,
      exactMatch: null,
      results: [],
      lastChecked: null,
    });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const checkCompanyName = useCallback(async (companyName: string) => {
    if (!companyName || companyName.trim().length < 2) {
      setValidationResult({
        isAvailable: null,
        isChecking: false,
        error: null,
        exactMatch: null,
        results: [],
        lastChecked: null,
      });
      return;
    }

    setValidationResult((prev) => ({
      ...prev,
      isChecking: true,
      error: null,
    }));

    try {
      const response = await fetch(
        `/api/companies-house/search?companyName=${encodeURIComponent(companyName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to check company availability");
      }

      const data = await response.json();

      setValidationResult({
        isAvailable: data.isAvailable,
        isChecking: false,
        error: null,
        exactMatch: data.exactMatch,
        results: data.results || [],
        lastChecked: new Date().toISOString(),
      });
    } catch (error: any) {
      setValidationResult((prev) => ({
        ...prev,
        isChecking: false,
        error: error.message || "Failed to validate company name",
      }));
    }
  }, []);

  const validateWithDebounce = useCallback((companyName: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setValidationResult((prev) => ({
      ...prev,
      isChecking: true,
    }));

    debounceTimer.current = setTimeout(() => {
      checkCompanyName(companyName);
    }, 800);
  }, [checkCompanyName]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    ...validationResult,
    validateWithDebounce,
    checkCompanyName,
  };
}
