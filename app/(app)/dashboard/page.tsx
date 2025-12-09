"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"

export default function DashboardPage() {
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [usage, setUsage] = useState({ used: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, usageRes] = await Promise.all([
        supabase
          .from("library_items")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5),
        fetch("/api/usage").then((r) => r.json()),
      ])

      if (itemsRes.data) {
        setRecentItems(itemsRes.data)
      }
      if (usageRes.resources_used !== undefined) {
        setUsage({ used: usageRes.resources_used, limit: usageRes.resource_limit })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resources Used</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.used} / {usage.limit}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
            <CardDescription>Your latest content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentItems.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Items in your library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/generate">Generate Content</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/library">View Library</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Library Items</CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items yet. Start by generating some content!</p>
              <Button asChild className="mt-4">
                <Link href="/generate">Generate Content</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/library/${item.id}`}
                  className="block p-4 border rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type} • {formatRelativeTime(item.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

