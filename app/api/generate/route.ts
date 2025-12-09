import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generate, type GenerationRequest } from "@/lib/ai-provider"

// Use Node runtime for server secrets (OPENAI_API_KEY, GEMINI_API_KEY)
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: GenerationRequest = await req.json()
    
    // Validate request
    if (!body.type || !body.topic) {
      return NextResponse.json(
        { error: "Missing required fields: type, topic" },
        { status: 400 }
      )
    }

    // Generate content
    const result = await generate(body)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 }
    )
  }
}

