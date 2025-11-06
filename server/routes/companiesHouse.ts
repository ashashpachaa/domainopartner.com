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
      companyName
    )}&items_per_page=10`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Companies House API error: ${response.status} ${response.statusText}`);
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
      return normalizedTitle.includes(normalizedQuery) || normalizedQuery.includes(normalizedTitle);
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
