import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { handleDemo } from "./routes/demo";
import { handleOCR } from "./routes/ocr";
import {
  handleCompanySearch,
  handleCompanyDetails,
  handleCompanyApprovalWebhook,
  handleWebhookStatus,
  handleIncorporationSubmission,
} from "./routes/companiesHouse";

const upload = multer({ storage: multer.memoryStorage() });

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // OCR endpoint
  app.post("/api/ocr/passport", upload.single("image"), handleOCR);

  // Companies House API endpoints
  app.get("/api/companies-house/search", handleCompanySearch);
  app.get("/api/companies-house/details", handleCompanyDetails);
  app.post("/api/companies-house/webhook", handleCompanyApprovalWebhook);
  app.get("/api/companies-house/webhook-status", handleWebhookStatus);

  return app;
}
