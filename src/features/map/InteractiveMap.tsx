"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet"
import { useTheme } from "next-themes"
import { CITY_ZONES, CityZone } from "@/config/zones"
import { useUrbanStore } from "@/store/useUrbanStore"
import "leaflet/dist/leaflet.css"

// Fix default icon path issue with Webpack
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const CITY_CENTER: [number, number] = [12.9700, 77.5900]

// Helper to darken colors for light mode borders
function getDarkerColor(hex: string): string {
  let color = hex.replace("#", "")
  if (color.length === 3) color = color.split("").map((c) => c + c).join("")
  const num = parseInt(color, 16)
  const r = Math.max(0, Math.round((num >> 16) * 0.5))
  const g = Math.max(0, Math.round(((num >> 8) & 0x00ff) * 0.5))
  const b = Math.max(0, Math.round((num & 0x0000ff) * 0.5))
  return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export default function InteractiveMap() {
  const { selectedZone, setSelectedZone, setIsAIPanelOpen } = useUrbanStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const handleZoneClick = (zone: CityZone) => {
    setSelectedZone(zone)
    setIsAIPanelOpen(false) // close panel when switching zones
  }

  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={14}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        key={isDark ? "dark" : "light"}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={
          isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        }
      />

      {CITY_ZONES.map((zone) => {
        const isSelected = selectedZone?.id === zone.id
        const borderColor = isDark ? zone.color : getDarkerColor(zone.color)
        
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: borderColor,
              fillColor: zone.color,
              fillOpacity: isSelected ? 0.45 : 0.25,
              weight: isSelected ? 3 : 1.5,
              opacity: isSelected ? 1 : 0.8,
            }}
            eventHandlers={{
              click: () => handleZoneClick(zone),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.4, weight: 2.5 })
              },
              mouseout: (e) => {
                if (selectedZone?.id !== zone.id) {
                  e.target.setStyle({ fillOpacity: 0.25, weight: 1.5 })
                }
              },
            }}
          >
            <Tooltip
              direction="center"
              permanent
              className="zone-label"
            >
              <span className="text-[11px] font-semibold" style={{ color: borderColor }}>
                {zone.name}
              </span>
            </Tooltip>
          </Polygon>
        )
      })}
    </MapContainer>
  )
}
