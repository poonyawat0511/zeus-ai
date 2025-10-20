"use client"
import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { ApiKeyCard } from "./ApiKeyCard"
import { Button } from "@heroui/react"

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: Date
    lastUsed?: Date
    status: "active" | "inactive"
}

export function ApiKeyManager() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    ])

    const handleGenerateKey = () => {
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: `Key${String(apiKeys.length + 1).padStart(3, "0")}`,
            key: `sk-or-v1-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
            createdAt: new Date(),
            status: "active",
        }
        setApiKeys([newKey, ...apiKeys])
    }

    const handleDeleteKey = (id: string) => setApiKeys(apiKeys.filter((k) => k.id !== id))
    const handleToggleStatus = (id: string) =>
        setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: k.status === "active" ? "inactive" : "active" } : k)))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-balance">API Keys</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your API keys for secure access</p>
                </div>
                <Button
                    onPress={handleGenerateKey}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/20"
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Generate API Key
                </Button>
            </div>

            <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                    <ApiKeyCard
                        key={apiKey.id}
                        apiKey={apiKey}
                        onDelete={handleDeleteKey}
                        onToggleStatus={handleToggleStatus}
                        tryHref={`/chat/plus`}
                    />
                ))}
            </div>

            {apiKeys.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 py-16">
                    <p className="text-sm text-muted-foreground">No API keys yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Click "Generate API Key" to create your first key</p>
                </div>
            )}
        </div>
    )
}
