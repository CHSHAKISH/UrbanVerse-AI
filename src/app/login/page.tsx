"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Zap, Mail, Lock, ArrowRight, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        })
      } else {
        toast.success("Welcome back!", { description: "Redirecting to dashboard..." })
        router.push("/")
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080c15]">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-cyan-600/6 blur-[80px]" />
        <div className="absolute right-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/5 blur-[80px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] px-5"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-8 shadow-2xl shadow-black/60 backdrop-blur-xl ring-1 ring-white/5">

          {/* Logo & Title */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/40">
              <Zap className="h-8 w-8 text-white" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">UrbanVerse AI</h1>
              <p className="mt-1 text-sm text-white/40">Urban Decision Intelligence Platform</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="mb-6 text-center text-[13px] font-medium text-white/50">
            Sign in to access your planning dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@urbanverse.ai"
                  required
                  className="w-full rounded-xl border border-white/8 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/8 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 rounded-xl border border-white/6 bg-white/3 p-4">
            <p className="mb-3 text-center text-[11px] font-medium text-white/35 uppercase tracking-wider">
              Demo Access
            </p>
            <div className="mb-3 flex items-center justify-center gap-3 text-xs">
              <code className="rounded-md bg-white/5 px-2 py-1 text-white/50">admin@urbanverse.ai</code>
              <span className="text-white/20">/</span>
              <code className="rounded-md bg-white/5 px-2 py-1 text-white/50">password123</code>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@urbanverse.ai")
                setPassword("password123")
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/5 py-2 text-xs font-medium text-white/60 transition hover:bg-white/8 hover:text-white/80"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/20">
          UrbanVerse AI · Powered by Google Gemini
        </p>
      </motion.div>
    </div>
  )
}
