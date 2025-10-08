import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const referer = process.env.SITE_URL || "https://zeus-ai-xi.vercel.app";
    const title = process.env.SITE_NAME || "ZEUS.AI";

    if (!apiKey) {
      return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
    }

    const { messages, model = "deepseek/deepseek-chat-v3.1" } = await req.json();

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "HTTP-Referer": referer,
        "X-Title": title,
      },
      body: JSON.stringify({ model, messages, stream: true }),
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      console.error("[OpenRouter ERROR]", upstream.status, text);
      return new Response(text || "Upstream error", { status: upstream.status || 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    console.error("API /api/chat error:", e?.stack || e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
