import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const monthKey = new Date().toISOString().slice(0, 7)
    
    const { data, error } = await supabase
      .from("usage_monthly")
      .select("resources_used, resource_limit, month_key")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // If no record exists, return default
    if (!data) {
      return NextResponse.json({
        resources_used: 0,
        resource_limit: 20,
        month_key: monthKey,
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Usage fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch usage" },
      { status: 500 }
    )
  }
}

