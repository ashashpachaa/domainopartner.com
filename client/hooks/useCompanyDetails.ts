import { RegisteredCompany, mockRegisteredCompanies } from "@/lib/mockData";

export interface CompanyDetailsResult {
  isLoading: boolean;
  error: string | null;
  data: RegisteredCompany | null;
}

export async function fetchCompanyDetails(
  companyNumber: string,
): Promise<CompanyDetailsResult> {
  if (!companyNumber || companyNumber.trim().length === 0) {
    return {
      isLoading: false,
      error: "Company number is required",
      data: null,
    };
  }

  try {
    const response = await fetch(
      `/api/companies-house/details?companyNumber=${encodeURIComponent(companyNumber)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch company details");
    }

    const apiData = await response.json();

    const registeredCompany: RegisteredCompany = {
      id: `company_${Date.now()}`,
      orderId: "", // Will be set by caller
      userId: "", // Will be set by caller
      companyNumber: apiData.companyNumber,
      companyName: apiData.companyName,
      country: apiData.country || "United Kingdom", // Default to UK if not provided
      incorporationDate: apiData.incorporationDate,
      nextRenewalDate: apiData.nextRenewalDate,
      nextAccountsFilingDate: apiData.accounts?.nextFilingDate || "",
      registeredOffice: apiData.registeredOffice?.address_line_1,
      sicCodes: apiData.sic,
      status: (apiData.status || "active") as
        | "active"
        | "dissolved"
        | "liquidation"
        | "administration",
      fetchedAt: new Date().toISOString(),
    };

    return {
      isLoading: false,
      error: null,
      data: registeredCompany,
    };
  } catch (error: any) {
    return {
      isLoading: false,
      error: error.message || "Failed to fetch company details",
      data: null,
    };
  }
}

export function storeRegisteredCompany(company: RegisteredCompany) {
  const companies = JSON.parse(
    localStorage.getItem("registeredCompanies") || "[]",
  );
  companies.push(company);
  localStorage.setItem("registeredCompanies", JSON.stringify(companies));
}

export function getRegisteredCompanies(): RegisteredCompany[] {
  const storageData = JSON.parse(
    localStorage.getItem("registeredCompanies") || "[]",
  );
  // Merge mock data with localStorage data, removing duplicates by ID
  const combined = [...mockRegisteredCompanies, ...storageData];
  const uniqueMap = new Map<string, RegisteredCompany>();
  combined.forEach((company) => {
    if (!uniqueMap.has(company.id)) {
      uniqueMap.set(company.id, company);
    }
  });
  return Array.from(uniqueMap.values());
}

export function getRegisteredCompaniesByUser(
  userId: string,
): RegisteredCompany[] {
  const companies = getRegisteredCompanies();
  return companies.filter((c) => c.userId === userId);
}

export function getRegisteredCompaniesByOrder(
  orderId: string,
): RegisteredCompany | undefined {
  const companies = getRegisteredCompanies();
  return companies.find((c) => c.orderId === orderId);
}
