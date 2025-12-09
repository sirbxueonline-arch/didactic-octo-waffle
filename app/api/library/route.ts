import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "active"
    const favorite = searchParams.get("favorite")
    const search = searchParams.get("search")

    let query = supabase
      .from("library_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (favorite === "true") {
      query = query.eq("favorite", true)
    }

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Library fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch library" },
      { status: 500 }
    )
  }
}

