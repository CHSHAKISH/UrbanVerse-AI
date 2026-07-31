/**
 * Prisma Seed Script — populates the Docker Postgres database with:
 * 1. The 8 predefined city zones from src/config/zones.ts
 * 2. A default admin user (for development testing)
 *
 * Run via: npx prisma db seed
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const SEED_ZONES = [
  { id: "ZONE_CBD",         name: "Central Business District", centerLat: 12.9716, centerLng: 77.5946, population: 85000,  trafficIndex: 78, carbonScore: 72, floodRisk: 18, accessibility: 88 },
  { id: "ZONE_RAILWAY",     name: "Railway Hub",               centerLat: 12.9780, centerLng: 77.5710, population: 32000,  trafficIndex: 91, carbonScore: 65, floodRisk: 22, accessibility: 95 },
  { id: "ZONE_RESIDENTIAL", name: "Residential Zone",          centerLat: 12.9580, centerLng: 77.5820, population: 210000, trafficIndex: 45, carbonScore: 38, floodRisk: 35, accessibility: 62 },
  { id: "ZONE_INDUSTRIAL",  name: "Industrial Area",           centerLat: 12.9900, centerLng: 77.6100, population: 12000,  trafficIndex: 62, carbonScore: 89, floodRisk: 28, accessibility: 41 },
  { id: "ZONE_RIVERFRONT",  name: "Riverfront",                centerLat: 12.9640, centerLng: 77.6050, population: 28000,  trafficIndex: 38, carbonScore: 29, floodRisk: 72, accessibility: 70 },
  { id: "ZONE_GREEN",       name: "Green Park",                centerLat: 12.9520, centerLng: 77.5620, population: 2000,   trafficIndex: 15, carbonScore: 8,  floodRisk: 12, accessibility: 55 },
  { id: "ZONE_HOSPITAL",    name: "Hospital District",         centerLat: 12.9840, centerLng: 77.5900, population: 18000,  trafficIndex: 55, carbonScore: 44, floodRisk: 15, accessibility: 82 },
  { id: "ZONE_UNIVERSITY",  name: "University Zone",           centerLat: 12.9500, centerLng: 77.6000, population: 55000,  trafficIndex: 52, carbonScore: 31, floodRisk: 20, accessibility: 74 },
]

async function main() {
  console.log("🌱 Seeding database...")

  // 1. Upsert zones (safe to run multiple times)
  for (const zone of SEED_ZONES) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: zone,
      create: zone,
    })
    console.log(`  ✅ Zone: ${zone.name}`)
  }

  // 2. Create default admin user
  const hashedPassword = await bcrypt.hash("password123", 12)
  const adminEmail = "admin@urbanverse.ai"

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "UrbanVerse Admin",
        email: adminEmail,
        password: hashedPassword,
      },
    })
    console.log(`  ✅ Admin user: ${adminEmail} (password: password123)`)
  } else {
    console.log(`  ⏭️  Admin user already exists, skipping.`)
  }

  console.log("✨ Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
