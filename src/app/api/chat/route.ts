import { NextRequest } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const runtime = "nodejs"; // ให้ run บน server runtime

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "deepseek/deepseek-chat-v3.1:free" } = await req.json();

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "",
        "X-Title": process.env.SITE_NAME ?? "",
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!resp.ok || !resp.body) {
      return new Response("Upstream error", { status: 500 });
    }

    // proxy เป็น text/event-stream กลับ client
    return new Response(resp.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}
