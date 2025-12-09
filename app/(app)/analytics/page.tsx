"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data: items } = await supabase
        .from("library_items")
        .select("created_at, type")
        .eq("status", "active")

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total, created_at")

      // Process data for charts
      const weeklyData = processWeeklyData(items || [])
      const scoreData = processScoreData(attempts || [])

      setStats({
        totalItems: items?.length || 0,
        weeklyData,
        scoreData,
        averageScore: attempts?.length
          ? attempts.reduce((acc: number, a: any) => acc + (a.score / a.total) * 100, 0) / attempts.length
          : 0,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const processWeeklyData = (items: any[]) => {
    const weeks: { [key: string]: number } = {}
    items.forEach((item) => {
      const date = new Date(item.created_at)
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      weeks[week] = (weeks[week] || 0) + 1
    })
    return Object.entries(weeks)
      .map(([week, count]) => ({ week, count }))
      .slice(-8)
  }

  const processScoreData = (attempts: any[]) => {
    return attempts
      .slice(-10)
      .map((a: any) => ({
        date: new Date(a.created_at).toLocaleDateString(),
        score: Math.round((a.score / a.total) * 100),
      }))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your study progress and performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Resources</CardTitle>
            <CardDescription>Saved items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Quiz Score</CardTitle>
            <CardDescription>All attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(stats.averageScore || 0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Keep up the great work!</li>
              <li>• Review weak topics regularly</li>
              <li>• Practice makes perfect</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources Created (Weekly)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.scoreData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#7C3AED" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

