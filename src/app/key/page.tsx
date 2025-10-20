import type { Metadata } from "next"
import { ApiKeyManager } from "./_components/ApiKeyManager"

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your API keys.",
}

export default function KeyPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid gap-6">
          <ApiKeyManager />
        </div>
      </section>
    </div>
  )
}
