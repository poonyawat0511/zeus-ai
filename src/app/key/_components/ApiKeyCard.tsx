"use client"
import { useState } from "react"
import NextLink from "next/link"
import {
    Card, CardHeader, CardBody, Button,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, cn,
} from "@heroui/react"
import {
    Copy as CopyIcon, Eye as EyeIcon, EyeOff as EyeOffIcon,
    MoreVertical as MoreVerticalIcon, Check as CheckIcon, Trash2 as TrashIcon,
    Power as PowerIcon, Calendar as CalendarIcon, Clock as ClockIcon,
    PlayCircle as PlayCircleIcon,
} from "lucide-react"

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: Date
    lastUsed?: Date
    status: "active" | "inactive"
}

interface ApiKeyCardProps {
    apiKey: ApiKey
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
    tryHref?: string
}

export function ApiKeyCard({ apiKey, onDelete, onToggleStatus, tryHref }: ApiKeyCardProps) {
    const [isRevealed, setIsRevealed] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const maskKey = (key: string) => {
        const prefix = key.substring(0, 12)
        const suffix = key.substring(key.length - 3)
        return `${prefix}...${suffix}`
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(apiKey.key)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)

    return (
        <Card className="group relative overflow-hidden border border-default-200 bg-content1 transition-all hover:shadow-md hover:shadow-primary/10">
            {/* Status indicator bar */}
            <div
                className={cn(
                    "absolute left-0 top-0 h-full w-1 transition-colors",
                    apiKey.status === "active"
                        ? "bg-gradient-to-b from-emerald-500 to-green-600"
                        : "bg-gradient-to-b from-gray-400 to-gray-500",
                )}
            />

            <CardHeader className="pb-0 pt-5 pl-6 pr-5">
                <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">{apiKey.name}</h3>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={apiKey.status === "active" ? "success" : "default"}
                            className={cn(
                                apiKey.status === "active"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-gray-600 dark:text-gray-400",
                            )}
                        >
                            {apiKey.status === "active" ? "Active" : "Inactive"}
                        </Chip>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                    aria-label="More actions"
                                >
                                    <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="API key actions">
                                <DropdownItem
                                    key="toggle"
                                    startContent={<PowerIcon className="h-4 w-4" />}
                                    onPress={() => onToggleStatus(apiKey.id)}
                                >
                                    {apiKey.status === "active" ? "Deactivate" : "Activate"}
                                </DropdownItem>
                                <DropdownItem key="copy" startContent={<CopyIcon className="h-4 w-4" />} onPress={handleCopy}>
                                    Copy Key
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<TrashIcon className="h-4 w-4" />}
                                    onPress={() => onDelete(apiKey.id)}
                                >
                                    Delete Key
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="p-5 pl-6 pt-3">
                {/* API Key Display */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-medium bg-content2/60 px-3 py-2.5 font-mono text-sm text-foreground ring-1 ring-default-200">
                        {isRevealed ? apiKey.key : maskKey(apiKey.key)}
                    </div>
                    <Button
                        isIconOnly
                        variant="light"
                        className="h-9 w-9 shrink-0"
                        onPress={() => setIsRevealed((v) => !v)}
                        aria-label={isRevealed ? "Hide key" : "Show key"}
                    >
                        {isRevealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                    <Button
                        isIconOnly
                        variant="light"
                        className="h-9 w-9 shrink-0"
                        onPress={handleCopy}
                        aria-label="Copy key"
                    >
                        {isCopied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                    {tryHref && (
                        <Button
                            as={NextLink}
                            href={tryHref}
                            size="sm"
                            variant="flat"
                            className="shadow-sm"
                            startContent={<PlayCircleIcon className="h-4 w-4" />}
                        >
                            Try
                        </Button>
                    )}
                </div>

                {/* Metadata */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-default-500">
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Created {formatDate(apiKey.createdAt)}</span>
                    </div>
                    {apiKey.lastUsed && (
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5" />
                            <span>Last used {formatDate(apiKey.lastUsed)}</span>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}
