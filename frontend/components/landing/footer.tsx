import Link from "next/link"
import { PetpoojaVaniLogo } from "@/components/petpooja-vani-logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <PetpoojaVaniLogo size={30} variant="light" />
            <span className="text-lg font-bold text-foreground">Petpooja Vani</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
            <Link href="#integrations" className="text-sm text-muted-foreground hover:text-foreground">Integrations</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            {"© 2026 Petpooja Vani. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  )
}
