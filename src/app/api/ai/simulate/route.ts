import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { ACTION_RULES, ActionType, runSimulation } from "@/config/rules"
import { getZoneById } from "@/config/zones"
import { SimulationResult } from "@/store/useUrbanStore"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Build the enum list from our rule engine so Gemini only picks valid actions
const ACTION_ENUM = Object.keys(ACTION_RULES) as ActionType[]

// Schema for structured intent extraction
const intentSchema = {
  type: Type.OBJECT,
  properties: {
    actions: {
      type: Type.ARRAY,
      description:
        "List of action types extracted from the user prompt. Pick all relevant actions. Max 8.",
      items: {
        type: Type.STRING,
        enum: ACTION_ENUM,
      },
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score 0-1 for the extraction",
    },
  },
  required: ["actions", "confidence"],
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, zoneId } = await req.json()

    if (!prompt || !zoneId) {
      return NextResponse.json({ error: "Missing prompt or zoneId" }, { status: 400 })
    }

    const zone = getZoneById(zoneId)
    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    // ── CALL 1: Extract actions from user prompt ──────────────────────────────
    const availableActions = ACTION_ENUM.map(
      (k) => `${k}: ${ACTION_RULES[k].label} — ${ACTION_RULES[k].description}`
    ).join("\n")

    const extractionPrompt = `
You are an urban planning AI assistant. Extract urban development actions from the user's request.

Available actions:
${availableActions}

User's request: "${prompt}"

Return a JSON object with the list of applicable action types. 
Only use actions from the available list above.
If the user mentions something multiple times, include it multiple times.
`

    const extractionResult = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: extractionPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: intentSchema as any,
      },
    })

    const extractedText = extractionResult.text
    if (!extractedText) throw new Error("No response from extraction model")
    
    const { actions } = JSON.parse(extractedText) as { actions: ActionType[]; confidence: number }

    if (!actions || actions.length === 0) {
      return NextResponse.json(
        { error: "Could not identify any valid urban actions from your prompt. Please be more specific." },
        { status: 422 }
      )
    }

    // ── CALL 2: Run deterministic Rule Engine ─────────────────────────────────
    const simulationOutput = runSimulation({
      baseMetrics: {
        trafficIndex: zone.metrics.trafficIndex,
        carbonScore: zone.metrics.carbonScore,
        floodRisk: zone.metrics.floodRisk,
        accessibility: zone.metrics.accessibility,
        population: zone.metrics.population,
      },
      actions,
    })

    // ── CALL 3: Generate AI narrative summary ─────────────────────────────────
    const { deltaMetrics, appliedActions } = simulationOutput
    const actionsList = appliedActions.map((a) => `${a.emoji} ${a.label}`).join(", ")

    const summaryPrompt = `
You are an expert urban planning consultant writing a concise impact assessment.

Zone: ${zone.name}
Zone Description: ${zone.description}
Actions Proposed: ${actionsList}

Metric Changes:
- Traffic Congestion: ${deltaMetrics.trafficIndex > 0 ? "+" : ""}${deltaMetrics.trafficIndex} points
- Carbon Emissions: ${deltaMetrics.carbonScore > 0 ? "+" : ""}${deltaMetrics.carbonScore} points  
- Flood Risk: ${deltaMetrics.floodRisk > 0 ? "+" : ""}${deltaMetrics.floodRisk} points
- Accessibility: ${deltaMetrics.accessibility > 0 ? "+" : ""}${deltaMetrics.accessibility} points
- Population Change: ${deltaMetrics.population > 0 ? "+" : ""}${deltaMetrics.population.toLocaleString()} residents

Write a concise, professional executive summary (3-4 sentences) that:
1. Acknowledges the proposed changes
2. Highlights the most significant positive impacts
3. Flags any notable tradeoffs or risks
4. Ends with a recommendation

Then provide exactly:
- 3 key benefits (short bullet points)
- 2 key risks (short bullet points)
- 2 actionable recommendations (short bullet points)

Format your response as JSON:
{
  "summary": "...",
  "benefits": ["...", "...", "..."],
  "risks": ["...", "..."],
  "recommendations": ["...", "..."]
}
`

    const summaryResult = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: summaryPrompt,
    })

    const summaryText = summaryResult.text
    if (!summaryText) throw new Error("No response from summary model")

    // Strip markdown code fences if present
    const cleanedSummary = summaryText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const narrativeData = JSON.parse(cleanedSummary) as {
      summary: string
      benefits: string[]
      risks: string[]
      recommendations: string[]
    }

    // ── Build the final response ───────────────────────────────────────────────
    const result: SimulationResult = {
      action: actionsList,
      zoneId: zone.id,
      zoneName: zone.name,
      updatedMetrics: simulationOutput.updatedMetrics as any,
      deltaMetrics: simulationOutput.deltaMetrics as any,
      aiSummary: narrativeData.summary,
      benefits: narrativeData.benefits,
      risks: narrativeData.risks,
      recommendations: narrativeData.recommendations,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("[AI Simulate Error]", err)
    return NextResponse.json(
      { error: err.message ?? "Simulation failed. Please try again." },
      { status: 500 }
    )
  }
}

