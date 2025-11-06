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
      return res.status(response.status).json({
        error: `Companies House API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    const exactMatch = data.items?.find(
      (item: any) =>
        item.title?.toLowerCase().trim() === companyName.toLowerCase().trim()
    );

    res.json({
      isAvailable: !exactMatch,
      totalResults: data.items_per_page || 0,
      exactMatch: exactMatch || null,
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
