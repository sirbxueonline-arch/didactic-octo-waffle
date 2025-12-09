"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StudyPage() {
  const [flashcardSets, setFlashcardSets] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStudyItems()
  }, [])

  const fetchStudyItems = async () => {
    try {
      const [flashcardsRes, quizzesRes] = await Promise.all([
        supabase
          .from("library_items")
          .select("*")
          .eq("type", "FLASHCARDS")
          .eq("status", "active"),
        supabase
          .from("library_items")
          .select("*")
          .eq("type", "QUIZ")
          .eq("status", "active"),
      ])

      if (flashcardsRes.data) setFlashcardSets(flashcardsRes.data)
      if (quizzesRes.data) setQuizzes(quizzesRes.data)
    } catch (error) {
      console.error("Error fetching study items:", error)
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
        <h1 className="text-3xl font-bold">Study Hub</h1>
        <p className="text-muted-foreground mt-2">
          Practice with flashcards and quizzes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Review with spaced repetition</CardDescription>
          </CardHeader>
          <CardContent>
            {flashcardSets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No flashcard sets yet</p>
                <Button asChild className="mt-4">
                  <Link href="/generate?tab=flashcards">Create Flashcards</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {flashcardSets.map((set) => (
                  <Link key={set.id} href={`/study/${set.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      {set.title}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quizzes</CardTitle>
            <CardDescription>Test your knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No quizzes yet</p>
                <Button asChild className="mt-4">
                  <Link href="/generate?tab=quiz">Create Quiz</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/study/${quiz.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      {quiz.title}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

