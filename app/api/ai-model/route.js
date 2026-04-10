import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {

  let body = null;

  try {
    body = await req.json();
  } catch (err) {
    console.log("Body parse error");
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  if (!body) {
    return NextResponse.json({
      error: "Empty body",
    });
  }

  const {
    jobPosition,
    jobDescription,
    duration,
    type,
  } = body;

  const FINAL_PROMPT = QUESTIONS_PROMPT
    .replace(/{{jobPosition}}/g, jobPosition || "")
    .replace(/{{jobDescription}}/g, jobDescription || "")
    .replace(/{{duration}}/g, duration || "")
    .replace(/{{type}}/g, type || "");

  try {

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion =
      await openai.chat.completions.create({
        model: "google/gemma-3-4b-it:free",
        messages: [
          {
            role: "user",
            content: FINAL_PROMPT,
          },
        ],
      });

    const content =
      completion?.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      content,
    });

  } catch (e) {
    console.log("AI error:", e);

    return NextResponse.json({
      error: e?.message || "AI generation failed",
      status: e?.status || 500,
    });
  }
}