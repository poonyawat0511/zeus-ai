"use client"

import { Button } from "@heroui/react"
import { Send, Paperclip, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Props = {
  value: string
  disabled?: boolean
  onChange: (v: string) => void
  onSend: () => void
  onHeightChange?: (h: number) => void

  showUpload?: boolean
  onUploadFiles?: (files: File[]) => void
  uploadAccept?: string

  attachments?: File[]
  onRemoveAttachment?: (index: number) => void
}

export default function ChatInput({
  value, disabled, onChange, onSend, onHeightChange,
  showUpload = false,
  onUploadFiles,
  uploadAccept = ".txt,.md,.csv,.json,text/*,application/json",
  attachments = [],
  onRemoveAttachment,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragOver, setDragOver] = useState(false)

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

  const handleNativePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length && onUploadFiles) onUploadFiles(files)
    e.currentTarget.value = "" // allow re-selecting same file
  }

  // Drag & drop
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (!showUpload) return
    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
    if (files.length && onUploadFiles) onUploadFiles(files)
  }
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (!showUpload) return
    e.preventDefault()
    setDragOver(true)
  }
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => setDragOver(false)

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-0 left-0 right-0 md:left-64 z-40 border-t border-border
                 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="p-4">
        <div
          className="flex gap-3 items-start"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div className="flex-1">
            <div className="relative">
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
                placeholder="Type your message…"
                className="w-full min-h-[44px] max-h-32 p-3 pr-12 bg-input border border-border rounded-lg
                           resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted"
                rows={1}
                style={{ height: "auto", minHeight: "44px" }}
              />

              {/* Drag overlay cue */}
              {showUpload && dragOver && (
                <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/60 ring-offset-2 bg-primary/5" />
              )}
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <span
                    key={`${f.name}-${i}`}
                    className="inline-flex items-center gap-2 rounded-md border border-default-200 bg-default-100/70 px-2 py-1 text-xs"
                  >
                    <span className="truncate max-w-[180px]" title={f.name}>{f.name}</span>
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => onRemoveAttachment(i)}
                        className="p-0.5 rounded hover:bg-default-200"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hidden native input (always in DOM for SSR parity) */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={uploadAccept}
            onChange={handleNativePick}
            className="hidden"
          />

          {/* Modern attach control (label → input) */}
          <label
            className={[
              "inline-flex items-center gap-2 h-11 px-3 rounded-lg border border-default-200",
              "bg-default-100 hover:bg-default-200 transition-colors cursor-pointer select-none",
              showUpload ? "" : "hidden",
            ].join(" ")}
            onClick={() => inputRef.current?.click()}
            title="Attach files"
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-xs">Attach</span>
          </label>

          <Button
            onPress={onSend}
            disabled={disabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 h-11 w-11 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Drop zone helper only when upload is allowed */}
        {showUpload && (
          <div className="mt-2 text-center text-xs text-muted">
            Drag & drop files here or click <span className="font-medium">Attach</span>.
          </div>
        )}
        {!showUpload && (
          <div className="mt-2 text-center text-xs text-muted">
            Press Enter to send, Shift + Enter for new line
          </div>
        )}
      </div>
    </div>
  )
}
