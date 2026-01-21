import express, { Request, Response } from "express";
import { BigQuery } from "@google-cloud/bigquery";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize BigQuery with service account
const bigquery = new BigQuery({
  keyFilename: path.join(__dirname, "..", "service-account.json"),
  projectId: "mobile-staging-376418",
});

const DATASET_ID = "ai_history";
const TABLE_ID = "seller_listing_insights";

interface SellerListingInsight {
  id: string;
  timestamp: string;
  environment: string;
  emptyPrompt: string;
  renderedPrompt: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  customerId: string | null;
  clientId: string | null;
  listingId: string;
  homeId: string | null;
  inputPayload: string;
  outputPayload: string;
}

// Serve static files
app.use(express.static(path.join(__dirname, "..", "public")));

// API endpoint to get seller listing insights
app.get("/api/insights", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const environment = req.query.environment as string;
    const listingId = req.query.listingId as string;
    const customerId = req.query.customerId as string;

    let whereClause = "";
    const conditions: string[] = [];

    if (environment) {
      conditions.push(`environment = '${environment}'`);
    }
    if (listingId) {
      conditions.push(`listingId = '${listingId}'`);
    }
    if (customerId) {
      conditions.push(`customerId = '${customerId}'`);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    const query = `
      SELECT *
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [rows] = await bigquery.query({ query });

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      ${whereClause}
    `;
    const [countResult] = await bigquery.query({ query: countQuery });
    const total = countResult[0]?.total || 0;

    res.json({
      data: rows,
      pagination: {
        limit,
        offset,
        total: Number(total),
      },
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: "Failed to fetch insights", details: String(error) });
  }
});

// API endpoint to get a single insight by ID
app.get("/api/insights/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT *
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE id = '${id}'
      LIMIT 1
    `;

    const [rows] = await bigquery.query({ query });

    if (rows.length === 0) {
      res.status(404).json({ error: "Insight not found" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching insight:", error);
    res.status(500).json({ error: "Failed to fetch insight", details: String(error) });
  }
});

// API endpoint to get unique environments
app.get("/api/environments", async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT DISTINCT environment
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      ORDER BY environment
    `;

    const [rows] = await bigquery.query({ query });
    res.json(rows.map((r: any) => r.environment));
  } catch (error) {
    console.error("Error fetching environments:", error);
    res.status(500).json({ error: "Failed to fetch environments", details: String(error) });
  }
});

// API endpoint to get stats
app.get("/api/stats", async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        COUNT(*) as totalRecords,
        COUNT(DISTINCT listingId) as uniqueListings,
        COUNT(DISTINCT customerId) as uniqueCustomers,
        SUM(inputTokens) as totalInputTokens,
        SUM(outputTokens) as totalOutputTokens,
        AVG(inputTokens) as avgInputTokens,
        AVG(outputTokens) as avgOutputTokens
      FROM \`${DATASET_ID}.${TABLE_ID}\`
    `;

    const [rows] = await bigquery.query({ query });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats", details: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
