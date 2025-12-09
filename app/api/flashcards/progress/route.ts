import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { set_id, card_key, box_level, next_due_at } = body

    if (!set_id || !card_key || box_level === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("flashcard_progress")
      .upsert({
        user_id: user.id,
        set_id,
        card_key,
        box_level,
        last_reviewed_at: new Date().toISOString(),
        next_due_at: next_due_at || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Flashcard progress error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    )
  }
}

