"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Zap, Mail, Lock, ArrowRight } from "lucide-react"
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-600/8 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-xl shadow-blue-500/30">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-100">UrbanVerse AI</h1>
              <p className="mt-1 text-sm text-gray-400">Urban Decision Intelligence Platform</p>
            </div>
          </div>

          <h2 className="mb-6 text-center text-lg font-semibold text-gray-200">
            Sign in to continue
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@urbanverse.ai"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 text-sm font-semibold text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Dev hint */}
          <div className="mt-6 space-y-3 rounded-xl border border-white/5 bg-white/3 p-4 text-center">
            <p className="text-xs text-gray-500">
              Dev credentials:{" "}
              <span className="font-mono text-gray-400">admin@urbanverse.ai</span>
              {" / "}
              <span className="font-mono text-gray-400">password123</span>
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full text-xs text-gray-200 hover:text-white"
              onClick={() => {
                setEmail("admin@urbanverse.ai")
                setPassword("password123")
              }}
            >
              Fill Demo Credentials
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
