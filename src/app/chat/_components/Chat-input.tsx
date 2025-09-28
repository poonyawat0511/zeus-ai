"use client"

import { useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { Button } from "@heroui/react"

type Props = {
  value: string
  disabled?: boolean
  onChange: (v: string) => void
  onSend: () => void
  onHeightChange?: (h: number) => void // รายงานความสูงให้พ่อ
}

export default function ChatInput({ value, disabled, onChange, onSend, onHeightChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // แจ้งความสูงให้พ่อ เว้นที่ด้านล่างของรายการข้อความ
  useEffect(() => {
    if (!wrapRef.current || !onHeightChange) return
    const ro = new ResizeObserver(() => onHeightChange(wrapRef.current!.offsetHeight))
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [onHeightChange])

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  const autoResize: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    const el = e.currentTarget
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 128) + "px"
  }

  return (
    // FIXED ที่ก้นหน้าจอ: ชดเชย sidebar ที่กว้าง w-64 (16rem) บนจอใหญ่
    <div
      ref={wrapRef}
      className="fixed bottom-0 left-0 right-0 md:left-64 z-40 border-t border-border
                 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                const el = e.currentTarget
                el.style.height = "auto"
                el.style.height = Math.min(el.scrollHeight, 128) + "px"
              }}
              onKeyDown={onKeyDown}
              onInput={autoResize}
              placeholder="Type your message here..."
              className="w-full min-h-[44px] max-h-32 p-3 pr-12 bg-input border border-border rounded-lg
                         resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted"
              rows={1}
              style={{ height: "auto", minHeight: "44px" }}
            />
          </div>
          <Button
            onPress={onSend}
            disabled={disabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 h-11 w-11 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  )
}
