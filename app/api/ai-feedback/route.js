import OpenAI from "openai";
import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { conversation } = await req.json();

  const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
    "{{conversation}}",
    JSON.stringify(conversation)
  );

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3-4b-it:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    const content = completion?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (e) {
    console.error("AI Feedback error:", e);
    return NextResponse.json({
      error: e?.message || "Feedback generation failed",
    });
  }
}

