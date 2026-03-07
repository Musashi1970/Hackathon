"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { PetpoojaVaniLogo } from "@/components/petpooja-vani-logo"

export function Navbar({ onSignIn }: { onSignIn?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <PetpoojaVaniLogo size={36} variant="light" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground leading-tight">Petpooja Vani</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">AI Voice Copilot</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="#integrations" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Integrations
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={onSignIn}>
            Sign In
          </Button>
          <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={onSignIn}>
            Start Free Trial
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="#features" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <Link href="#integrations" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Integrations
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setMobileOpen(false); onSignIn?.() }}>
                Sign In
              </Button>
              <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => { setMobileOpen(false); onSignIn?.() }}>
                Start Free Trial
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
