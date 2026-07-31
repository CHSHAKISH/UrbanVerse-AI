import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/scenarios/compare?ids=id1,id2
 * Returns the two requested scenarios for side-by-side comparison.
 * Both must belong to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rawIds = req.nextUrl.searchParams.get("ids")
    if (!rawIds) {
      return NextResponse.json({ error: "Missing ids param" }, { status: 400 })
    }

    const ids = rawIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 2) // maximum 2

    if (ids.length !== 2) {
      return NextResponse.json({ error: "Exactly 2 ids required" }, { status: 400 })
    }

    const scenarios = await prisma.scenario.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id, // enforce ownership
      },
      include: {
        zone: { select: { name: true } },
        events: true,
      },
    })

    if (scenarios.length !== 2) {
      return NextResponse.json(
        { error: "One or both scenarios not found or access denied" },
        { status: 404 }
      )
    }

    // Return in the same order as requested
    const ordered = ids.map((id) => scenarios.find((s) => s.id === id)!)

    return NextResponse.json(ordered)
  } catch (err: any) {
    console.error("[Scenarios Compare GET Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
