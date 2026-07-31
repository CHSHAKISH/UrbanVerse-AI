"use client"

import { useUrbanStore } from "@/store/useUrbanStore"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { MapWrapper } from "@/features/map/MapWrapper"
import { ZoneInfoCard } from "@/features/map/ZoneInfoCard"
import { AIPlanningPanel } from "@/features/ai/AIPlanningPanel"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const selectedZone = useUrbanStore((s) => s.selectedZone)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar />

      {/* Main content offset by sidebar width (4rem = 64px) */}
      <div className="flex flex-1 flex-col pl-16">
        <Navbar />

        {/* Map area below navbar (3.5rem = 56px) */}
        <main className="relative flex-1 overflow-hidden pt-14">
          <MapWrapper />

          {/* Zone Info Card overlaid on map */}
          <AnimatePresence>
            {selectedZone && <ZoneInfoCard zone={selectedZone} />}
          </AnimatePresence>

          {/* AI Planning Panel — slides in over map when zone is selected */}
          {selectedZone && <AIPlanningPanel zone={selectedZone} />}

          {/* Welcome pill — shown when no zone is selected */}
          <AnimatePresence>
            {!selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-6 z-[1000] -translate-x-1/2"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-gray-950/80 px-4 py-2 shadow-xl backdrop-blur-md">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                  <span className="text-sm text-gray-300">
                    Click a zone on the map to begin analysis
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

