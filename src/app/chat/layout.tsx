"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import ChatBar, { type ConversationItem } from "./_components/Chat-bar"
import ChatInput from "./_components/Chat-input"

export interface Message {
    id: string
    content: string
    sender: "user" | "assistant"
    timestamp: Date
}

type ChatContextType = {
    messages: Message[]
    isTyping: boolean
    inputValue: string
    setInputValue: (v: string) => void
    send: () => void
}
const ChatContext = createContext<ChatContextType | null>(null)
export const useChatUI = () => {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error("useChatUI must be used within /chat/layout")
    return ctx
}

// helper: map state → openai messages
function toOpenAIMessages(messages: { sender: "user" | "assistant"; content: string }[]) {
    return messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
    }));
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", content: "Hello! I'm your AI assistant. How can I help you today?", sender: "assistant", timestamp: new Date() },
    ])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [navH, setNavH] = useState(0)      // navbar height
    const [inputH, setInputH] = useState(96) // chat input height (fixed)

    // วัดความสูง header จริง ๆ และอัปเดตเมื่อรีไซซ์
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
        if (!inputValue.trim()) return;
        const userMessage: Message = { id: Date.now().toString(), content: inputValue, sender: "user", timestamp: new Date() };
        setMessages((p) => [...p, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // เตรียม assistant เปล่าไว้ต่อท้าย
        const assistantId = (Date.now() + 1).toString();
        setMessages((p) => [...p, { id: assistantId, content: "", sender: "assistant", timestamp: new Date() }]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: toOpenAIMessages([...messages, userMessage]) }),
            });
            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // parse event-stream: บรรทัดที่ขึ้นต้นด้วย "data: "
                const lines = buffer.split("\n");
                for (let i = 0; i < lines.length - 1; i++) {
                    const ln = lines[i].trim();
                    if (!ln.startsWith("data:")) continue;
                    const payload = ln.slice(5).trim();
                    if (payload === "[DONE]") continue;
                    try {
                        const json = JSON.parse(payload);
                        const delta: string = json.choices?.[0]?.delta?.content ?? "";
                        if (delta) {
                            setMessages((p) =>
                                p.map((m) => (m.id === assistantId ? { ...m, content: (m.content ?? "") + delta } : m))
                            );
                        }
                    } catch { }
                }
                buffer = lines[lines.length - 1];
            }
        } catch (e) {
            console.error(e);
            setMessages((p) =>
                p.map((m) => (m.id === assistantId ? { ...m, content: "⚠️ มีปัญหาเชื่อมต่อสตรีม" } : m))
            );
        } finally {
            setIsTyping(false);
        }
    };


    const conversations: ConversationItem[] = [
        { id: "current", title: "Current Conversation", subtitle: "Today", active: true },
    ]

    return (
        <ChatContext.Provider value={{ messages, isTyping, inputValue, setInputValue, send }}>
            {/* ให้คอนเทนต์หลักเว้นที่ด้านซ้ายเท่ากับ sidebar เมื่อจอ >= md */}
            <div className="h-full min-h-0 overflow-hidden md:pl-64">
                {/* ChatBar fixed ซ้าย (นอก flow) */}
                <ChatBar conversations={conversations} topOffset={navH} />

                {/* พื้นที่หลัก (ขวา) */}
                <main className="h-full min-h-0 flex flex-col">
                    {/* โซนสกรอลล์: เว้น padding-bottom เท่าความสูง input ที่ fixed */}
                    <div
                        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6"
                        style={{ paddingBottom: inputH + 16 }}
                    >
                        {children}
                    </div>

                    {/* ChatInput fixed ล่างหน้าจอ (ชดเชยซ้ายที่ md ด้วย) */}
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
