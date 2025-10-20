"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, Avatar } from "@heroui/react"
import { useChatUI } from "../layout"
import ModelSelector from "../_components/TierSelector"

export default function ChatPlusPage() {
  const { messages, isTyping } = useChatUI()
  const endRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isTyping])

  // helper: client-only formatting
  const fmtTime = (d: Date) =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(d)

  return (
    <>
      <ModelSelector />

      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
          {m.sender === "assistant" && <Avatar className="w-8 h-8 mt-1" />}
          <div className={`max-w-[70%] ${m.sender === "user" ? "order-first" : ""}`}>
            <Card className={`p-4 ${m.sender === "user" ? "bg-secondary text-secondary-foreground ml-auto" : "bg-card text-card-foreground"}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </Card>

            {/* NOTE: suppressHydrationWarning prevents mismatch on first paint */}
            <div
              className={`text-xs text-muted mt-1 ${m.sender === "user" ? "text-right" : "text-left"}`}
              suppressHydrationWarning
            >
              {mounted ? fmtTime(m.timestamp) : ""} 
            </div>
          </div>
          {m.sender === "user" && <Avatar className="w-8 h-8 mt-1" />}
        </div>
      ))}

      <div ref={endRef} />
    </>
  )
}
