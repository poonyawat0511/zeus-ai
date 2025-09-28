"use client"

import { useEffect, useRef } from "react"
import { Card, Avatar } from "@heroui/react"
import { useChatUI } from "./layout"

export default function ChatPage() {
  const { messages, isTyping } = useChatUI()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <>
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
          {m.sender === "assistant" && <Avatar className="w-8 h-8 mt-1" />}
          <div className={`max-w-[70%] ${m.sender === "user" ? "order-first" : ""}`}>
            <Card className={`p-4 ${m.sender === "user" ? "bg-secondary text-secondary-foreground ml-auto" : "bg-card text-card-foreground"}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </Card>
            <div className={`text-xs text-muted mt-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
              {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          {m.sender === "user" && <Avatar className="w-8 h-8 mt-1" />}
        </div>
      ))}
      <div ref={endRef} />
    </>
  )
}
