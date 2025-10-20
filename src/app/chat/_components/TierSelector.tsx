// src/app/chat/_components/ModelSelector.tsx
"use client"

import { Select, SelectItem, type Selection } from "@heroui/react"
import { useChatUI } from "../layout"

const MODEL_OPTIONS = [
  { key: "deepseek/deepseek-chat-v3.1", label: "Free Trial" },
  { key: "openai/gpt-4o-mini", label: "E-Commerce Model (Only Plus)" },
]

export default function ModelSelector() {
  const { model, setModel } = useChatUI()

  return (
    <Select
      aria-label="Select model"
      label="Model"
      className="mb-4"
      selectedKeys={new Set([model])}
      onSelectionChange={(keys: Selection) => {
        const first = Array.from(keys)[0] as string | undefined
        if (first) setModel(first)
      }}
    >
      {MODEL_OPTIONS.map((m) => (
        <SelectItem key={m.key}>{m.label}</SelectItem>
      ))}
    </Select>
  )
}
