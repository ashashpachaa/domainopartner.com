export async function handleCompanySearch(req: any, res: any) {
  const { companyName } = req.query;

  if (!companyName || companyName.trim().length === 0) {
    return res.status(400).json({
      error: "Company name is required",
    });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Companies House API key not configured",
    });
  }

  try {
    const searchUrl = `https://api.companieshouse.gov.uk/search/companies?q=${encodeURIComponent(
      companyName,
    )}&items_per_page=10`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Companies House API error: ${response.status} ${response.statusText}`,
      );
      return res.status(response.status).json({
        error: `Companies House API error: ${response.statusText}`,
        status: response.status,
      });
    }

    const data = await response.json();

    console.log("Companies House API response:", {
      query: companyName,
      itemsCount: data.items?.length || 0,
      items: data.items?.slice(0, 5),
    });

    if (!data.items || data.items.length === 0) {
      res.json({
        isAvailable: true,
        totalResults: 0,
        exactMatch: null,
        results: [],
      });
      return;
    }

    const normalizeForComparison = (str: string) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "");
    };

    const normalizedQuery = normalizeForComparison(companyName);

    const exactMatch = data.items?.find((item: any) => {
      const normalizedTitle = normalizeForComparison(item.title || "");
      return normalizedTitle === normalizedQuery;
    });

    const similarMatch = data.items?.find((item: any) => {
      const normalizedTitle = normalizeForComparison(item.title || "");
      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedTitle)
      );
    });

    res.json({
      isAvailable: !exactMatch && !similarMatch,
      totalResults: data.items_per_page || data.items.length || 0,
      exactMatch: exactMatch || null,
      similarMatch: similarMatch || null,
      results: data.items?.slice(0, 5) || [],
    });
  } catch (error: any) {
    console.error("Companies House API error:", error);
    res.status(500).json({
      error: "Failed to check company availability",
      details: error.message,
    });
  }
}

const pendingWebhookUpdates: any[] = [];

export async function handleCompanyApprovalWebhook(req: any, res: any) {
  try {
    const { incorporationId, companyNumber, authCode, status } = req.body;

    if (!incorporationId || !companyNumber) {
      return res.status(400).json({
        error: "Missing required fields: incorporationId, companyNumber",
      });
    }

    const update = {
      incorporationId,
      companyNumber,
      authCode: authCode || "",
      status: status || "approved",
      timestamp: new Date().toISOString(),
    };

    pendingWebhookUpdates.push(update);

    console.log("Companies House Webhook Received:", update);

    res.json({
      success: true,
      message: "Webhook received successfully",
      incorporationId,
      companyNumber,
      timestamp: update.timestamp,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      error: "Failed to process webhook",
      details: error.message,
    });
  }
}

export async function handleWebhookStatus(req: any, res: any) {
  try {
    const updates = [...pendingWebhookUpdates];

    res.json({
      success: true,
      updates: updates,
      count: updates.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Webhook status error:", error);
    res.status(500).json({
      error: "Failed to fetch webhook status",
      details: error.message,
    });
  }
}

export function generateCompanyNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${timestamp.toString().slice(-6)}${random}`;
}

export async function handleCompanyDetails(req: any, res: any) {
  const { companyNumber } = req.query;

  if (!companyNumber || companyNumber.trim().length === 0) {
    return res.status(400).json({
      error: "Company number is required",
    });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Companies House API key not configured",
    });
  }

  try {
    const detailsUrl = `https://api.companieshouse.gov.uk/company/${companyNumber}`;

    const response = await fetch(detailsUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Companies House API error: ${response.status} ${response.statusText}`,
      );
      return res.status(response.status).json({
        error: `Failed to fetch company details: ${response.statusText}`,
        status: response.status,
      });
    }

    const data = await response.json();

    const incorporationDate = data.date_of_creation
      ? new Date(data.date_of_creation).toISOString().split("T")[0]
      : null;

    // Calculate next renewal date (3 years from incorporation or anniversary)
    let nextRenewalDate = null;
    if (incorporationDate) {
      const incDate = new Date(incorporationDate);
      const nextRenewal = new Date(
        incDate.getFullYear() + 3,
        incDate.getMonth(),
        incDate.getDate(),
      );
      nextRenewalDate = nextRenewal.toISOString().split("T")[0];
    }

    // Get accounts filing date
    const accountsFilingDate = data.accounts?.next_made_up_to
      ? new Date(data.accounts.next_made_up_to).toISOString().split("T")[0]
      : null;

    res.json({
      companyNumber: data.company_number,
      companyName: data.company_name,
      status: data.company_status,
      incorporationDate: incorporationDate,
      registeredOffice: data.registered_office_address,
      sic: data.sic_codes,
      accounts: {
        nextFilingDate: accountsFilingDate,
        nextDueDate: data.accounts?.next_accounts?.due_on,
      },
      nextRenewalDate: nextRenewalDate,
      fullDetails: data,
    });
  } catch (error: any) {
    console.error("Companies House API error:", error);
    res.status(500).json({
      error: "Failed to fetch company details",
      details: error.message,
    });
  }
}
