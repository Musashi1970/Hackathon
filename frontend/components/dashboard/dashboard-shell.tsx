"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { isAuthenticated, clearAuthenticated } from "@/lib/auth"
import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Mic,
  BarChart3,
  DollarSign,
  Settings,
  Plug,
  Palette,
  Bot,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  ChevronRight,
  MessageCircle,
  Download,
  Send,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PetpoojaVaniLogo } from "@/components/petpooja-vani-logo"
import { chatWithGroq, type ChatMessage } from "@/lib/groq"

function FloatingChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your AI pricing analyst. Ask me about menu performance, margins, pricing recommendations, or sales trends." },
  ])
  const messagesEndRef = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return
    const userMsg = message.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setMessage("")
    setIsLoading(true)

    try {
      const history: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userMsg },
      ]
      const reply = await chatWithGroq(history)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong"
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${errMsg}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          isOpen
            ? "bg-slate-700 hover:bg-slate-800"
            : "bg-[#DC2626] hover:bg-[#B91C1C] hover:scale-105"
        )}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-[#DC2626] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-white/80">Powered by Petpooja Vani</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[320px] overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "ml-auto bg-[#DC2626] text-white rounded-br-sm"
                    : "bg-slate-100 text-foreground rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-[#E5E7EB] px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setMessage("Which items have the highest profit margin?")}
                className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs text-foreground hover:bg-slate-200"
              >
                Top margins
              </button>
              <button
                onClick={() => setMessage("Which items are underperforming and need a price change?")}
                className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs text-foreground hover:bg-slate-200"
              >
                Underperformers
              </button>
              <button
                onClick={() => setMessage("Suggest a combo to boost slow-selling items")}
                className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs text-foreground hover:bg-slate-200"
              >
                Combo ideas
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E7EB] p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 rounded-full border border-[#E5E7EB] bg-slate-50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DC2626] text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface NavSection {
  title: string
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
}

const navSections: NavSection[] = [
  {
    title: "Home",
    items: [
      { href: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
      { href: "/dashboard/kitchen", label: "Kitchen Orders", icon: ChefHat },
      { href: "/dashboard/voice-logs", label: "Voice Assistant Logs", icon: Mic },
      { href: "/dashboard/review-queue", label: "Review Queue", icon: AlertTriangle },
    ],
  },
  {
    title: "Growth Intelligence",
    items: [
      { href: "/dashboard/menu-intelligence", label: "Menu Intelligence", icon: BarChart3 },
      { href: "/dashboard/pricing", label: "Pricing, Combos & Upselling", icon: DollarSign },
      { href: "/dashboard/inventory", label: "Inventory", icon: ClipboardList },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/dashboard/settings", label: "General", icon: Settings },
      { href: "/dashboard/settings/ai-assistant", label: "AI Assistant", icon: Bot },
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
      { href: "/dashboard/settings/appearance", label: "Appearance", icon: Palette },
    ],
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.replace("/")
    } else {
      setAuthChecked(true)
    }
  }, [router])

  // Global search shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const isActive = useCallback((href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }, [pathname])

  return (
    <>
    {!authChecked ? (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#CF1F2E]" />
      </div>
    ) : (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]" suppressHydrationWarning>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - white with red active highlights */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E5E7EB] bg-white transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-[#E5E7EB] px-5">
          <PetpoojaVaniLogo size={34} variant="light" />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#1F2937] leading-tight">PetpoojaVaani</span>
            <span className="text-[10px] text-[#6B7280]">AI Voice Assistant</span>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5 text-[#1F2937]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {section.title}
              </div>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-[#FFF5F5] text-[#8B0000]"
                            : "text-[#1F2937] hover:bg-[#FFF5F5] hover:text-[#8B0000]"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-[#8B0000]" : "text-[#6B7280]")} />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="h-4 w-4 text-[#8B0000]" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Voice Assistant Toggle */}
        <div className="border-t border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-3">
            <div>
              <div className="text-xs font-medium text-[#1F2937]">Voice Assistant</div>
              <div className={cn("text-xs", voiceAssistantActive ? "text-emerald-600" : "text-[#6B7280]")}>
                {voiceAssistantActive ? "Active" : "Paused"}
              </div>
            </div>
            {mounted && (
              <Switch checked={voiceAssistantActive} onCheckedChange={setVoiceAssistantActive} />
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-5 w-5 text-[#1F2937]" />
          </button>

          {/* Search with Cmd+K */}
          <div className="hidden flex-1 md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280] transition-colors hover:border-[#D1D5DB]"
            >
              <Search className="h-4 w-4" />
              <span>Search orders, menu items, customers...</span>
              <kbd className="ml-auto rounded border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                Cmd+K
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Restaurant Selector */}
            <Button variant="outline" size="sm" className="hidden gap-2 border-[#E5E7EB] text-sm text-[#1F2937] md:inline-flex">
              {"Raj's Kitchen - Koramangala"}
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[#6B7280]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6]">
                <User className="h-4 w-4 text-[#6B7280]" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-[#1F2937]">Raj Malhotra</div>
                <div className="text-xs text-[#6B7280]">Owner</div>
              </div>
            </div>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              className="text-[#6B7280] hover:text-[#DC2626]"
              onClick={() => { clearAuthenticated(); router.replace("/") }}
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Floating Chat Assistant */}
      <FloatingChatAssistant />

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl rounded-xl border border-[#E5E7EB] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3">
              <Search className="h-5 w-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search orders, menu items, customers..."
                className="flex-1 bg-transparent text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
                autoFocus
              />
              <kbd className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                ESC
              </kbd>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3">Quick Actions</div>
              <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F9FAFB]">
                  <ClipboardList className="h-4 w-4 text-[#6B7280]" />
                  View Recent Orders
                </button>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F9FAFB]">
                  <BarChart3 className="h-4 w-4 text-[#6B7280]" />
                  Open Menu Intelligence
                </button>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F9FAFB]">
                  <Download className="h-4 w-4 text-[#6B7280]" />
                  Export Orders CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </>
  )
}
