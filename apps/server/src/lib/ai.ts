import { Groq } from "groq-sdk";
import { aiNotify } from "./socket.js";
import { extractTextFromPdf } from "./pdf.js";
import { analyzePrompt } from "./prompts.js";
import { PrismaClient, ContractStatus } from "../../prisma/generated/index.js";

const prisma = new PrismaClient();

const groq = new Groq();

export const startContractAnalysis = async (
  fileUrl: string,
  userId: string,
  contractId: string
) => {
  try {
    aiNotify("ai:processing_started", { userId, fileUrl, contractId });

    // Step 1: Extract text from PDF
    const contractText = await extractTextFromPdf(fileUrl);
    aiNotify("ai:extraction_progress", {
      userId,
      contractId,
      progress: "Text extraction complete",
    });

    // Step 2: Send to Groq AI
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: analyzePrompt },
        {
          role: "user",
          content: `This is the contract text: \n${contractText}`,
        },
      ],
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: {
        type: "json_object",
      },
      stop: null,
    });

    const rawOutput = response.choices[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (err) {
      console.error("Failed to parse AI response as JSON:", rawOutput);
      parsed = { error: "Invalid JSON from AI" };
    }

    aiNotify("ai:confidence_update", {
      userId,
      contractId,
      confidence: parsed.confidence_score || null,
    });
    aiNotify("ai:suggestion_generated", {
      userId,
      contractId,
      suggestions: parsed.risk_assessment?.recommendations || [],
    });
    aiNotify("ai:analysis_complete", { userId, contractId, analysis: parsed });

    // Step 3: Save analysis to database
    await prisma.contract.update({
      where: { id: contractId, userId },
      data: {
        metadata: parsed,
      },
    });
  } catch (error) {
    console.error("AI Analysis error:", error);
    aiNotify("ai:analysis_complete", {
      userId,
      contractId,
      error: "AI analysis failed",
    });
  }
};
