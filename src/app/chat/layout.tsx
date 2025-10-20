"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import ChatBar, { type ConversationItem } from "./_components/Chat-bar"
import ChatInput from "./_components/Chat-input"

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

type Tier = "free" | "plus"

type ChatContextType = {
  messages: Message[]
  isTyping: boolean
  inputValue: string
  setInputValue: (v: string) => void
  send: () => void

  // Keep Tier for UI mock (optional to use)
  tier: Tier
  setTier: (t: Tier) => void

  // Selected model (this now determines the route)
  model: string
  setModel: (m: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)
export const useChatUI = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatUI must be used within /chat/layout")
  return ctx
}

// === Route mapping by model ===
// old model → old route, new model(s) → new route
const MODEL_TO_ROUTE: Record<string, "/api/chat" | "/api/chat/plus"> = {
  "deepseek/deepseek-chat-v3.1": "/api/chat",        // Old model → old route
  "openai/gpt-4o-mini": "/api/chat/plus",            // New model → new route
  // add more mappings as needed
}

// helper: map state → OpenAI-style messages
function toOpenAIMessages(messages: { sender: "user" | "assistant"; content: string }[]) {
  return messages.map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.content,
  }))
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Layout helpers (for sticky header/input)
  const [navH, setNavH] = useState(0)
  const [inputH, setInputH] = useState(96)

  // Mock plan + selected model (UI)
  const [tier, setTier] = useState<Tier>("plus")
  const [model, setModel] = useState<string>("deepseek/deepseek-chat-v3.1")

  useEffect(() => {
    const getNavH = () => {
      const header = document.querySelector("header") as HTMLElement | null
      setNavH(header ? header.offsetHeight : 0)
    }
    getNavH()
    window.addEventListener("resize", getNavH)
    return () => window.removeEventListener("resize", getNavH)
  }, [])

  const send = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((p) => [...p, userMessage])
    setInputValue("")
    setIsTyping(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages((p) => [...p, { id: assistantId, content: "", sender: "assistant", timestamp: new Date() }])

    try {
      // Route is chosen by selected model (fallback to tier, then old route)
      const path =
        MODEL_TO_ROUTE[model] ??
        (tier === "plus" ? "/api/chat/plus" : "/api/chat")

      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toOpenAIMessages([...messages, userMessage]),
          model, // always pass through the chosen model
        }),
      })

      const contentType = res.headers.get("content-type") || ""

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        setMessages((p) =>
          p.map((m) =>
            m.id === assistantId
              ? { ...m, content: `❌ HTTP ${res.status}${errText ? `: ${errText}` : ""}` }
              : m
          )
        )
        setIsTyping(false)
        return
      }

      // Handle both SSE and non-SSE (plain text) responses
      if (!contentType.includes("text/event-stream") || !res.body) {
        const txt = await res.text().catch(() => "")
        setMessages((p) =>
          p.map((m) =>
            m.id === assistantId
              ? { ...m, content: txt || "⚠️ ไม่ได้รับสตรีมจากเซิร์ฟเวอร์" }
              : m
          )
        )
        setIsTyping(false)
        return
      }

      // Parse SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder("utf-8")

      let buffer = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        for (let i = 0; i < lines.length - 1; i++) {
          const ln = lines[i].trim()
          if (!ln.startsWith("data:")) continue
          const payload = ln.slice(5).trim()
          if (payload === "[DONE]") continue
          try {
            const json = JSON.parse(payload)
            const delta: string = json.choices?.[0]?.delta?.content ?? ""
            if (delta) {
              setMessages((p) =>
                p.map((m) => (m.id === assistantId ? { ...m, content: (m.content ?? "") + delta } : m))
              )
            }
          } catch {
            // ignore per-line parse errors
          }
        }
        buffer = lines[lines.length - 1]
      }
    } catch (e) {
      console.error(e)
      setMessages((p) =>
        p.map((m) => (m.id === assistantId ? { ...m, content: "⚠️ มีปัญหาเชื่อมต่อสตรีม" } : m))
      )
    } finally {
      setIsTyping(false)
    }
  }

  const conversations: ConversationItem[] = [
    { id: "current", title: "Current Conversation", subtitle: "Today", active: true },
  ]

  const ctxValue = useMemo<ChatContextType>(() => ({
    messages,
    isTyping,
    inputValue,
    setInputValue,
    send,
    tier,
    setTier,
    model,
    setModel,
  }), [messages, isTyping, inputValue, tier, model])

  return (
    <ChatContext.Provider value={ctxValue}>
      {/* Leave space for sidebar on md+ */}
      <div className="h-full min-h-0 overflow-hidden md:pl-64">
        <ChatBar conversations={conversations} topOffset={navH} />
        <main className="h-full min-h-0 flex flex-col">
          <div
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6"
            style={{ paddingBottom: inputH + 16 }}
          >
            {children}
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={send}
            disabled={!inputValue.trim() || isTyping}
            onHeightChange={setInputH}
          />
        </main>
      </div>
    </ChatContext.Provider>
  )
}
