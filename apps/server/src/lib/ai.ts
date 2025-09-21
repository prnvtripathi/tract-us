import { Groq } from "groq-sdk";
import { aiNotify } from "./socket";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzePrompt } from "./prompts";

const groq = new Groq();

export const startContractAnalysis = async (
  fileUrl: string,
  userId: string
) => {
  try {
    aiNotify("ai:processing_started", { userId, fileUrl });

    // Step 1: Extract text from PDF
    const contractText = await extractTextFromPdf(fileUrl);
    aiNotify("ai:extraction_progress", {
      userId,
      progress: "Text extraction complete",
    });

    // Step 2: Send to Groq AI
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: analyzePrompt },
        {
          role: "user",
          content: `This is the contract text: \n${contractText}`,
        },
      ],
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
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
      confidence: parsed.confidence_score || null,
    });
    aiNotify("ai:suggestion_generated", {
      userId,
      suggestions: parsed.risk_assessment?.recommendations || [],
    });
    aiNotify("ai:analysis_complete", { userId, analysis: parsed });
  } catch (error) {
    console.error("AI Analysis error:", error);
    aiNotify("ai:analysis_complete", { userId, error: "AI analysis failed" });
  }
};
