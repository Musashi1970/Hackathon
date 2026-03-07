import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Play, Phone, Sparkles, TrendingUp, ShoppingCart } from "lucide-react"

export function HeroSection({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="text-sm font-medium text-brand">Petpooja Vani — AI-Powered Restaurant Automation</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            AI Voice Copilot for{" "}
            <span className="text-brand">Modern Restaurants</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Petpooja Vani automates voice ordering, upsells intelligently, and syncs every order to your POS in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8 bg-brand text-brand-foreground hover:bg-brand/90" onClick={onSignIn}>
                Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </div>

          {/* Product illustration - Dashboard preview */}
          <div className="mt-16 w-full max-w-5xl">
            <div className="rounded-xl border border-border bg-card shadow-2xl shadow-foreground/5 overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center">
                  <div className="mx-auto h-6 w-64 rounded-md bg-muted" />
                </div>
              </div>

              {/* Dashboard preview content */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Revenue Today", value: "₹1,24,500", icon: TrendingUp, change: "+12.5%" },
                    { label: "Avg Order Value", value: "₹385", icon: ShoppingCart, change: "+8.2%" },
                    { label: "AI Upsell Revenue", value: "₹18,200", icon: Bot, change: "+24.1%" },
                    { label: "Voice Orders", value: "47", icon: Phone, change: "+15.3%" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="mt-1 text-sm font-medium text-success">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Mini chart mockup */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="text-sm font-medium text-foreground">Peak Order Hours</div>
                    <div className="mt-3 flex items-end gap-1.5">
                      {[30, 45, 60, 80, 95, 70, 55, 90, 100, 75, 50, 35].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-brand/80 transition-all"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="text-sm font-medium text-foreground">Voice AI Activity</div>
                    <div className="mt-4 flex flex-col gap-2">
                      {["Incoming call detected...", "AI: How may I help you?", "Customer: 2 Mysore Masala Dosa please", "AI: Would you like Filter Coffee with that?"].map((line, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? "bg-success" : "bg-brand"}`} />
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
