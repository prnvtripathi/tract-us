import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();
const upload = multer(); // stores files in memory

// Create S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

// Function to upload file to S3
export async function uploadToS3(
  file: Express.Multer.File,
  user: string
): Promise<string> {
  // Take only the first 10 characters of the filename and remove spaces
  let baseFilename =
    file.originalname.length <= 10
      ? file.originalname
      : file.originalname.substring(0, 10);
  baseFilename = baseFilename.replace(/\s+/g, "_").replace(/\.pdf$/i, ""); // remove .pdf extension if present

  const key = `${user}/${Date.now()}_${baseFilename}.pdf`;

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: "application/pdf",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
  return fileUrl;
}
