// src/app/api/chat/plus/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ===== Types ===== */
type Role = "system" | "user" | "assistant" | "tool";
type ChatMessage = { role: Role; content: string };

const ROLES: Role[] = ["system", "user", "assistant", "tool"];
const isRole = (v: any): v is Role => typeof v === "string" && (ROLES as string[]).includes(v);

/** Coerce any incoming messages into our strict ChatMessage[] */
function normalizeMessages(input: any): ChatMessage[] {
  if (!Array.isArray(input)) throw new Error("`messages` must be an array");
  return input.map((m, i) => {
    const role: Role = isRole(m?.role) ? (m.role as Role) : "user";
    const content = typeof m?.content === "string" ? m.content : String(m?.content ?? "");
    if (!content) {
      // empty strings are allowed, but make sure it's a string
    }
    return { role, content };
  });
}

/** ===== Limits (adjust as needed) ===== */
const MAX_FILE_MB = 20;
const MAX_TOTAL_MB = 80;
const MAX_TEXT_CHARS = 120_000;
const MAX_CSV_ROWS = 5000;

/** Simple helpers */
const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + " MB";
const isTextLike = (filename = "", type = "") => {
  const lower = filename.toLowerCase();
  return (
    type.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".json")
  );
};

/** Parse CSV into limited text without heavy deps */
async function csvToLimitedText(file: File, maxRows: number): Promise<string> {
  const raw = await file.text();
  const lines = raw.split(/\r?\n/);
  const head = lines.slice(0, 1).join("\n");
  const body = lines.slice(1, 1 + maxRows).join("\n");
  const truncated =
    lines.length - 1 > maxRows
      ? `\n[[Truncated: first ${maxRows} data rows of ${lines.length - 1}]]`
      : "";
  return `${head}\n${body}${truncated}`;
}

/** Read file to safe text with caps */
async function readFileToTextLimited(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const csv = await csvToLimitedText(file, MAX_CSV_ROWS);
    return csv.length > MAX_TEXT_CHARS
      ? csv.slice(0, MAX_TEXT_CHARS) + `\n\n[[Truncated at ${MAX_TEXT_CHARS} chars]]`
      : csv;
  }

  const text = await file.text();
  return text.length > MAX_TEXT_CHARS
    ? text.slice(0, MAX_TEXT_CHARS) + `\n\n[[Truncated at ${MAX_TEXT_CHARS} chars]]`
    : text;
}

/** Build a single context block from all uploaded files */
async function buildContextFromFormData(form: FormData) {
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return { context: "", meta: { files: [] as any[], totalBytes: 0 } };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
    throw new Response(
      `Total upload ${mb(totalBytes)} exceeds MAX_TOTAL_MB=${MAX_TOTAL_MB} MB.`,
      { status: 413 }
    );
  }

  const parts: string[] = [];
  const meta: any[] = [];

  for (const file of files) {
    const sizeOk = file.size <= MAX_FILE_MB * 1024 * 1024;
    if (!sizeOk) {
      meta.push({ file: file.name, size: file.size, accepted: false, reason: `> ${MAX_FILE_MB} MB` });
      continue;
    }

    if (!isTextLike(file.name, file.type)) {
      meta.push({ file: file.name, size: file.size, accepted: false, reason: "unsupported type" });
      continue;
    }

    try {
      const content = await readFileToTextLimited(file);
      parts.push(`\n==== FILE: ${file.name} (${mb(file.size)}) ====\n${content}`);
      meta.push({ file: file.name, size: file.size, accepted: true, chars: content.length });
    } catch (e: any) {
      meta.push({ file: file.name, size: file.size, accepted: false, reason: e?.message || "read error" });
    }
  }

  const header =
    "You are given raw excerpts from user-uploaded files. Answer strictly from these excerpts.\n" +
    "If the answer is not present, say you don't have enough information.\n";

  const context = parts.length ? header + parts.join("\n") : "";
  return { context, meta: { files: meta, totalBytes } };
}

/** Merge context into messages */
function mergeContextIntoMessages({
  messages,
  context,
  mode = "system",
}: {
  messages: ChatMessage[];
  context: string;
  mode?: "system" | "prepend";
}): ChatMessage[] {
  if (!context) return messages;

  if (mode === "system") {
    return [{ role: "system", content: context }, ...messages];
  }

  const idx = messages.findIndex((m) => m.role === "user");
  if (idx === -1) {
    return [
      ...messages,
      { role: "user", content: `--- FILE CONTEXT START ---\n${context}\n--- FILE CONTEXT END ---` },
    ];
  }
  const clone = messages.slice();
  clone[idx] = {
    ...clone[idx],
    content:
      `--- FILE CONTEXT START ---\n${context}\n--- FILE CONTEXT END ---\n\n` +
      (clone[idx].content || ""),
  };
  return clone;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const referer = process.env.SITE_URL || "https://zeus-ai-xi.vercel.app";
    const title = process.env.SITE_NAME || "ZEUS.AI";

    if (!apiKey) {
      return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
    }

    let model = "deepseek/deepseek-chat-v3.1";
    let mergedMessages: ChatMessage[] = [];
    let contextMode: "system" | "prepend" = "system";

    const ctype = req.headers.get("content-type") || "";

    if (ctype.includes("multipart/form-data")) {
      // ---- multipart: files + messages (stringified JSON) ----
      const form = await req.formData();

      const rawMessages = form.get("messages");
      if (typeof rawMessages !== "string") {
        return new Response("Missing `messages` (stringified JSON) in form-data.", { status: 400 });
      }

      const baseMessages = normalizeMessages(JSON.parse(rawMessages));

      const rawModel = form.get("model");
      if (typeof rawModel === "string" && rawModel.trim()) model = rawModel.trim();

      const rawMode = form.get("contextMode");
      if (rawMode === "system" || rawMode === "prepend") contextMode = rawMode;

      const { context } = await buildContextFromFormData(form);
      mergedMessages = mergeContextIntoMessages({
        messages: baseMessages,
        context,
        mode: contextMode,
      });
    } else {
      // ---- JSON body (backward compatible) ----
      const body = await req.json();
      model = body.model || model;

      const baseMessages = normalizeMessages(body.messages);

      if (typeof body.context === "string" && body.context.trim()) {
        const mode: "system" | "prepend" = body.contextMode === "prepend" ? "prepend" : "system";
        mergedMessages = mergeContextIntoMessages({
          messages: baseMessages,
          context: body.context,
          mode,
        });
      } else {
        mergedMessages = baseMessages;
      }
    }

    // ---- Call OpenRouter (stream) ----
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "HTTP-Referer": referer,
        "X-Title": title,
      },
      body: JSON.stringify({ model, messages: mergedMessages, stream: true }),
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
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    console.error("API /api/chat error:", e?.stack || e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
