import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SimulationResult } from "@/store/useUrbanStore"

/** GET /api/scenarios — fetch the authenticated user's scenario history */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scenarios = await prisma.scenario.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "desc" },
      take: 50,
      include: { events: true, zone: { select: { name: true } } },
    })

    return NextResponse.json(scenarios)
  } catch (err: any) {
    console.error("[Scenarios GET Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/** POST /api/scenarios — save a simulation result to the database */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: SimulationResult = await req.json()
    const { zoneId, action, aiSummary, deltaMetrics } = body

    if (!zoneId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Extract action type strings from the emoji-label action string
    // e.g. "🚇 Metro Station, 🌳 Urban Park" — we store the actions in Event records
    const actionLabels = action.split(",").map((a) => a.trim())

    const scenario = await prisma.scenario.create({
      data: {
        userId: session.user.id,
        zoneId,
        title: `${body.zoneName} — ${actionLabels[0]}${actionLabels.length > 1 ? ` +${actionLabels.length - 1} more` : ""}`,
        action,
        aiSummary: aiSummary ?? null,
        trafficImpact: deltaMetrics?.trafficIndex ?? null,
        carbonImpact: deltaMetrics?.carbonScore ?? null,
        floodImpact: deltaMetrics?.floodRisk ?? null,
        accessibilityImpact: deltaMetrics?.accessibility ?? null,
        events: {
          create: actionLabels.map((label) => ({
            type: label,
          })),
        },
      },
    })

    return NextResponse.json(scenario, { status: 201 })
  } catch (err: any) {
    console.error("[Scenarios POST Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
