import { Router } from "express";
import { uploadToS3 } from "@/lib/s3";
import multer from "multer";
import { PrismaClient, ContractStatus } from "prisma/generated";

const upload = multer();
const prisma = new PrismaClient();
const router: Router = Router();

// constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
let FILE_URL = null; // placeholder for file URL

// POST /api/ai/analyze - Upload PDF for AI processing
// Expects 'file' in multipart/form-data
router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { clientName, data, status, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request body" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size exceeds 5MB" });
    }

    const fileUrl = await uploadToS3(req.file, userId);
    const contract = await prisma.contract.create({
      // After removing `contractId` from schema, generated types will not require it. Until then,
      // keep this cast to satisfy types pre-migration.
      data: {
        clientName,
        data,
        status: status ?? ContractStatus.DRAFT,
        userId,
        fileUrl,
      } as any,
    });
    FILE_URL = fileUrl; // store the file URL
    res.json({
      success: true,
      fileUrl,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
