"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet"
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

export default function InteractiveMap() {
  const { selectedZone, setSelectedZone, setIsAIPanelOpen } = useUrbanStore()

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {CITY_ZONES.map((zone) => {
        const isSelected = selectedZone?.id === zone.id
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: isSelected ? 0.45 : 0.25,
              weight: isSelected ? 3 : 1.5,
              opacity: isSelected ? 1 : 0.7,
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
              <span className="text-[11px] font-semibold" style={{ color: zone.color }}>
                {zone.name}
              </span>
            </Tooltip>
          </Polygon>
        )
      })}
    </MapContainer>
  )
}
