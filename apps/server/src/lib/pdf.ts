import { Mistral } from "@mistralai/mistralai";
/**
 * Analyze PDF using Mistral OCR
 * @param fileUrl URL to the PDF file (e.g., from S3)
 * @returns Extracted plain text from the PDF
 */

const apiKey = process.env.MISTRAL_API_KEY;

export const extractTextFromPdf = async (fileUrl: string): Promise<string> => {
  try {
    const client = new Mistral({ apiKey: apiKey });

    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: fileUrl,
      },
      includeImageBase64: false,
      documentAnnotationFormat: { type: "text", jsonSchema: null },
    });

    console.log({ ocrResponse });

    return ocrResponse.documentAnnotation || "";
  } catch (error) {
    console.error("Error during PDF OCR:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
