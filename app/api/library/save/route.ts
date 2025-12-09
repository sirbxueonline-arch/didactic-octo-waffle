import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

// Use Node runtime for server secrets (SUPABASE_SERVICE_ROLE_KEY)
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, title, subject, tags, payload } = body

    if (!type || !title || !payload) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Use service role client to call RPC
    const serviceClient = await createServiceClient()
    
    const { data, error } = await serviceClient.rpc("save_library_item_with_limit", {
      p_type: type,
      p_title: title,
      p_subject: subject || null,
      p_tags: tags || [],
      p_payload: payload,
    })

    if (error) {
      // Check if it's a limit error
      if (error.message?.includes("RESOURCE_LIMIT") || error.code === "P0001") {
        const monthKey = new Date().toISOString().slice(0, 7)
        return NextResponse.json(
          {
            code: "RESOURCE_LIMIT",
            message: "Monthly resource limit reached",
            monthKey,
            limit: 20,
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: error.message || "Failed to save" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data })
  } catch (error: any) {
    console.error("Save error:", error)
    return NextResponse.json(
      { error: error.message || "Save failed" },
      { status: 500 }
    )
  }
}

