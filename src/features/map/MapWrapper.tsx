"use client"

import dynamic from "next/dynamic"

// Leaflet uses window/document - must be client-side only
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm text-gray-400">Loading map…</span>
      </div>
    </div>
  ),
})

export function MapWrapper() {
  return <InteractiveMap />
}
