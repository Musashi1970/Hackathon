"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { setAuthenticated } from "@/lib/auth"
import { X, Lock, User, Loader2, Eye, EyeOff } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!open) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.")
      return
    }

    setLoading(true)

    try {
      if (supabase) {
        const { data, error: dbError } = await supabase
          .from("login_system")
          .select("id")
          .eq("username", username.trim())
          .eq("password", password)
          .maybeSingle()

        if (dbError) {
          setError("Unable to verify credentials. Please try again.")
          setLoading(false)
          return
        }

        if (!data) {
          setError("Invalid username or password.")
          setLoading(false)
          return
        }
      } else {
        // Fallback: local validation if Supabase is unavailable
        if (username.trim() !== "Petpooja" || password !== "Petpooja@2026") {
          setError("Invalid username or password.")
          setLoading(false)
          return
        }
      }

      setAuthenticated()
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#CF1F2E] to-[#e8394a] px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="mt-1 text-sm text-white/80">Sign in to Petpooja Vani Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-6 py-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
              <span className="shrink-0">⚠</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#CF1F2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b91c29] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
