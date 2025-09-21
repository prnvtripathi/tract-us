import { Mistral } from "@mistralai/mistralai";

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
    });

    // the reponse has pages array with text content
    // Content is in ocrResponse.pages[i].markdown
    // Join all pages' content into a single string
    const fullText = ocrResponse.pages
      .map((page) => page.markdown)
      .join("\n\n--- End of Page ---\n\n");

    return fullText;
  } catch (error) {
    console.error("Error during PDF OCR:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
