"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function LibraryItemPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/library/${params.id}`)
      if (!response.ok) {
        throw new Error("Item not found")
      }
      const data = await response.json()
      setItem(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load item",
        variant: "destructive",
      })
      router.push("/library")
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = () => {
    if (!item) return
    const dataStr = JSON.stringify(item.payload, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${item.title.replace(/\s+/g, "_")}.json`
    link.click()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!item) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-muted-foreground mt-2">
            {item.type} • Created {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {item.type === "QUIZ" && (
            <Button onClick={() => router.push(`/study/${item.id}`)}>
              Start Quiz
            </Button>
          )}
          {item.type === "FLASHCARDS" && (
            <Button onClick={() => router.push(`/study/${item.id}`)}>
              Study Flashcards
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {item.type === "EXPLAIN" && (
            <div className="space-y-4">
              {item.payload.explanation && (
                <div>
                  <h3 className="font-semibold mb-2">Explanation</h3>
                  <p className="text-muted-foreground">{item.payload.explanation}</p>
                </div>
              )}
              {item.payload.keyPoints && (
                <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {item.payload.keyPoints.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {item.type === "FLASHCARDS" && (
            <div className="space-y-2">
              {item.payload.cards?.map((card: any, i: number) => (
                <div key={i} className="border rounded p-4">
                  <div className="font-semibold mb-2">Q: {card.front}</div>
                  <div className="text-muted-foreground">A: {card.back}</div>
                </div>
              ))}
            </div>
          )}

          {item.type === "QUIZ" && (
            <div className="space-y-4">
              {item.payload.questions?.map((q: any, i: number) => (
                <div key={i} className="border rounded p-4">
                  <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                  <ul className="space-y-1 ml-4">
                    {q.options.map((opt: string, j: number) => (
                      <li key={j} className="text-muted-foreground">
                        {String.fromCharCode(65 + j)}. {opt}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Explanation: {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {item.type === "PLAN" && (
            <div className="space-y-4">
              {item.payload.duration && (
                <div>
                  <h3 className="font-semibold mb-2">Duration</h3>
                  <p>{item.payload.duration}</p>
                </div>
              )}
              {item.payload.goals && (
                <div>
                  <h3 className="font-semibold mb-2">Goals</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {item.payload.goals.map((goal: string, i: number) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExportJSON}>
          Export JSON
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </div>
  )
}

