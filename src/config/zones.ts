import { LatLngTuple } from "leaflet"

export interface ZoneMetrics {
  population: number
  trafficIndex: number   // 0-100, higher = more congested
  carbonScore: number    // 0-100, higher = more emissions
  floodRisk: number      // 0-100, higher = more at risk
  accessibility: number  // 0-100, higher = more accessible
}

export interface CityZone {
  id: string
  name: string
  description: string
  color: string
  center: LatLngTuple
  polygon: LatLngTuple[]
  metrics: ZoneMetrics
}

// UrbanVerse fictional city centered around a fictitious Indian city
// Coordinates are fictional - inspired by a medium-sized Indian urban area
export const CITY_ZONES: CityZone[] = [
  {
    id: "ZONE_CBD",
    name: "Central Business District",
    description: "The economic heart of UrbanVerse — dense commercial towers, government offices, and high footfall.",
    color: "#3b82f6",
    center: [12.9716, 77.5946],
    polygon: [
      [12.980, 77.585],
      [12.980, 77.604],
      [12.965, 77.604],
      [12.965, 77.585],
    ],
    metrics: {
      population: 85000,
      trafficIndex: 78,
      carbonScore: 72,
      floodRisk: 18,
      accessibility: 88,
    },
  },
  {
    id: "ZONE_RAILWAY",
    name: "Railway Hub",
    description: "Major transit interchange connecting suburban and intercity rail with bus terminals.",
    color: "#f59e0b",
    center: [12.9780, 77.5710],
    polygon: [
      [12.983, 77.565],
      [12.983, 77.577],
      [12.973, 77.577],
      [12.973, 77.565],
    ],
    metrics: {
      population: 32000,
      trafficIndex: 91,
      carbonScore: 65,
      floodRisk: 22,
      accessibility: 95,
    },
  },
  {
    id: "ZONE_RESIDENTIAL",
    name: "Residential Zone",
    description: "Large low-to-mid density residential area with parks, schools, and local markets.",
    color: "#22c55e",
    center: [12.9580, 77.5820],
    polygon: [
      [12.965, 77.573],
      [12.965, 77.591],
      [12.951, 77.591],
      [12.951, 77.573],
    ],
    metrics: {
      population: 210000,
      trafficIndex: 45,
      carbonScore: 38,
      floodRisk: 35,
      accessibility: 62,
    },
  },
  {
    id: "ZONE_INDUSTRIAL",
    name: "Industrial Area",
    description: "Manufacturing plants, warehouses, and logistics hubs. High emissions, low residential density.",
    color: "#ef4444",
    center: [12.9900, 77.6100],
    polygon: [
      [12.997, 77.603],
      [12.997, 77.617],
      [12.983, 77.617],
      [12.983, 77.603],
    ],
    metrics: {
      population: 12000,
      trafficIndex: 62,
      carbonScore: 89,
      floodRisk: 28,
      accessibility: 41,
    },
  },
  {
    id: "ZONE_RIVERFRONT",
    name: "Riverfront",
    description: "Scenic waterfront district with heritage buildings, promenades, and mixed-use developments.",
    color: "#06b6d4",
    center: [12.9640, 77.6050],
    polygon: [
      [12.969, 77.599],
      [12.969, 77.611],
      [12.959, 77.611],
      [12.959, 77.599],
    ],
    metrics: {
      population: 28000,
      trafficIndex: 38,
      carbonScore: 29,
      floodRisk: 72,
      accessibility: 70,
    },
  },
  {
    id: "ZONE_GREEN",
    name: "Green Park",
    description: "Large urban forest and recreational park providing an ecological buffer zone.",
    color: "#84cc16",
    center: [12.9520, 77.5620],
    polygon: [
      [12.958, 77.556],
      [12.958, 77.568],
      [12.946, 77.568],
      [12.946, 77.556],
    ],
    metrics: {
      population: 2000,
      trafficIndex: 15,
      carbonScore: 8,
      floodRisk: 12,
      accessibility: 55,
    },
  },
  {
    id: "ZONE_HOSPITAL",
    name: "Hospital District",
    description: "Cluster of major public and private hospitals, medical colleges, and research institutes.",
    color: "#ec4899",
    center: [12.9840, 77.5900],
    polygon: [
      [12.989, 77.584],
      [12.989, 77.596],
      [12.979, 77.596],
      [12.979, 77.584],
    ],
    metrics: {
      population: 18000,
      trafficIndex: 55,
      carbonScore: 44,
      floodRisk: 15,
      accessibility: 82,
    },
  },
  {
    id: "ZONE_UNIVERSITY",
    name: "University Zone",
    description: "Dense cluster of universities, research labs, tech parks and student accommodation.",
    color: "#a855f7",
    center: [12.9500, 77.6000],
    polygon: [
      [12.956, 77.594],
      [12.956, 77.606],
      [12.944, 77.606],
      [12.944, 77.594],
    ],
    metrics: {
      population: 55000,
      trafficIndex: 52,
      carbonScore: 31,
      floodRisk: 20,
      accessibility: 74,
    },
  },
]

export const getZoneById = (id: string): CityZone | undefined =>
  CITY_ZONES.find((z) => z.id === id)
