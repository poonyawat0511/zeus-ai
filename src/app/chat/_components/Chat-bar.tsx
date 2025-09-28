"use client"

import { useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { Button, Card } from "@heroui/react"

export type ConversationItem = {
    id: string
    title: string
    subtitle?: string
    active?: boolean
}

type Props = {
    conversations: ConversationItem[]
    onNewChat?: () => void
    onSelect?: (id: string) => void
    className?: string
    topOffset?: number   // px ชดเชยความสูง navbar
}

export default function ChatBar({
    conversations,
    onNewChat,
    onSelect,
    className = "",
    topOffset = 0,
}: Props) {
    const wrapRef = useRef<HTMLDivElement>(null)

    // ป้องกัน overscroll bounce ในบางเบราว์เซอร์
    useEffect(() => {
        if (!wrapRef.current) return
        wrapRef.current.addEventListener("touchmove", () => { }, { passive: true })
    }, [])

    return (
        <aside
            ref={wrapRef}
            // fixed ซ้าย, สูงเต็มที่เหลือ (100dvh - navbar)
            className={`fixed left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}
            style={{
                top: topOffset,
                height: `calc(100dvh - ${topOffset}px)`,
            }}
        >
            <div className="p-4 border-b border-sidebar-border">
                <Button
                    onPress={onNewChat}
                    className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2">
                <div className="space-y-2">
                    {conversations.map((c) => (
                        <Card
                            key={c.id}
                            isPressable
                            onPress={() => onSelect?.(c.id)}
                            className={[
                                "block w-full p-3 cursor-pointer transition-colors", // ⬅️ เพิ่ม block w-full
                                c.active
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "bg-transparent text-sidebar-foreground hover:bg-sidebar-accent/60",
                            ].join(" ")}
                        >
                            <div className="font-medium text-sm truncate">{c.title}</div>
                            {c.subtitle && (
                                <div className="text-xs text-sidebar-foreground/70 mt-1 truncate">
                                    {c.subtitle}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

        </aside>
    )
}
