import { useMemo } from "react";
import { mockCompanyIncorporations, RegisteredCompany, CompanyIncorporation } from "@/lib/mockData";

export function useCompanyIncorporationLink() {
  /**
   * Get the CompanyIncorporation linked to a RegisteredCompany
   * This allows viewing and filing amendments from any company dashboard
   */
  const getIncorporationForCompany = (registeredCompany: RegisteredCompany): CompanyIncorporation | null => {
    if (!registeredCompany.incorporationId) {
      return null;
    }

    // Try to find in localStorage first (user-created incorporations)
    const stored = localStorage.getItem(`incorporation_${registeredCompany.incorporationId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fall back to mock data
    return mockCompanyIncorporations.find(
      (inc) => inc.id === registeredCompany.incorporationId
    ) || null;
  };

  /**
   * Check if a RegisteredCompany can file amendments
   * (must be linked to a CompanyIncorporation)
   */
  const canFileAmendments = (registeredCompany: RegisteredCompany): boolean => {
    if (!registeredCompany.incorporationId) return false;
    const incorporation = getIncorporationForCompany(registeredCompany);
    return incorporation !== null && incorporation.status === "completed";
  };

  /**
   * Get amendment history for a RegisteredCompany
   */
  const getAmendmentHistory = (registeredCompany: RegisteredCompany) => {
    const incorporation = getIncorporationForCompany(registeredCompany);
    return incorporation?.amendments || [];
  };

  return {
    getIncorporationForCompany,
    canFileAmendments,
    getAmendmentHistory,
  };
}
