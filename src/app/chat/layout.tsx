"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
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
  tier: Tier
  setTier: (t: Tier) => void
  model: string
  setModel: (m: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)
export const useChatUI = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatUI must be used within /chat/layout")
  return ctx
}

const MODEL_TO_ROUTE: Record<string, "/api/chat" | "/api/chat/plus"> = {
  "deepseek/deepseek-chat-v3.1": "/api/chat",
  "openai/gpt-4o-mini": "/api/chat/plus",
}

function toOpenAIMessages(messages: { sender: "user" | "assistant"; content: string }[]) {
  return messages.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const inPlus = pathname === "/chat/plus"

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! I'm your AI assistant. How can I help you today?", sender: "assistant", timestamp: new Date() },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const [navH, setNavH] = useState(0)
  const [inputH, setInputH] = useState(96)

  const [tier, setTier] = useState<Tier>("plus")
  const [model, setModel] = useState<string>("deepseek/deepseek-chat-v3.1")

  // NEW: attachments state
  const [attachments, setAttachments] = useState<File[]>([])
  const addAttachments = (files: File[]) => setAttachments((prev) => [...prev, ...files])
  const removeAttachmentAt = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index))

  useEffect(() => {
    const getNavH = () => {
      const header = document.querySelector("header") as HTMLElement | null
      setNavH(header ? header.offsetHeight : 0)
    }
    getNavH()
    window.addEventListener("resize", getNavH)
    return () => window.removeEventListener("resize", getNavH)
  }, [])

  const streamInto = async (res: Response, assistantId: string) => {
    const ct = res.headers.get("content-type") || ""
    if (!res.ok || !ct.includes("text/event-stream") || !res.body) {
      const txt = await res.text().catch(() => "")
      setMessages((p) => p.map((m) => (m.id === assistantId ? { ...m, content: txt || `❌ HTTP ${res.status}` } : m)))
      return
    }
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
            setMessages((p) => p.map((m) => (m.id === assistantId ? { ...m, content: (m.content ?? "") + delta } : m)))
          }
        } catch {}
      }
      buffer = lines[lines.length - 1]
    }
  }

  const send = async () => {
    // allow sending if there is text OR there are files
    if (!inputValue.trim() && attachments.length === 0) return

    // show the user's text message if present
    let userMessage: Message | null = null
    if (inputValue.trim()) {
      userMessage = { id: Date.now().toString(), content: inputValue, sender: "user", timestamp: new Date() }
      setMessages((p) => [...p, userMessage!])
      setInputValue("")
    }

    setIsTyping(true)
    const assistantId = (Date.now() + 1).toString()
    setMessages((p) => [...p, { id: assistantId, content: "", sender: "assistant", timestamp: new Date() }])

    try {
      // If in /chat/plus AND we have attachments → send multipart
      if (inPlus && attachments.length > 0) {
        const form = new FormData()
        form.append("model", model)
        form.append("contextMode", "system")
        // include history + the new user message (if any)
        const history = userMessage ? [...messages, userMessage] : messages
        form.append("messages", JSON.stringify(toOpenAIMessages(history)))
        attachments.forEach((f) => form.append("files", f, f.name))

        const res = await fetch("/api/chat/plus", { method: "POST", body: form })
        await streamInto(res, assistantId)
        setAttachments([]) // clear after successful send
      } else {
        // fallback: plain JSON (no files)
        const path = MODEL_TO_ROUTE[model] ?? (tier === "plus" ? "/api/chat/plus" : "/api/chat")
        const history = userMessage ? [...messages, userMessage] : messages
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toOpenAIMessages(history), model }),
        })
        await streamInto(res, assistantId)
      }
    } catch {
      setMessages((p) => p.map((m) => (m.id === assistantId ? { ...m, content: "⚠️ Connection issue." } : m)))
    } finally {
      setIsTyping(false)
    }
  }

  const conversations: ConversationItem[] = [
    { id: "current", title: "Current Conversation", subtitle: "Today", active: true },
  ]

  const ctxValue = useMemo<ChatContextType>(() => ({
    messages, isTyping, inputValue, setInputValue, send, tier, setTier, model, setModel,
  }), [messages, isTyping, inputValue, tier, model])

  return (
    <ChatContext.Provider value={ctxValue}>
      <div className="h-full min-h-0 overflow-hidden md:pl-64">
        <ChatBar conversations={conversations} topOffset={navH} />
        <main className="h-full min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" style={{ paddingBottom: inputH + 16 }}>
            {children}
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={send}
            // enable Send if there is text OR there are files
            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
            onHeightChange={setInputH}
            showUpload={inPlus}
            onUploadFiles={inPlus ? addAttachments : undefined}
            uploadAccept=".txt,.md,.csv,.json,text/*,application/json"
            attachments={attachments}
            onRemoveAttachment={removeAttachmentAt}
          />
        </main>
      </div>
    </ChatContext.Provider>
  )
}
