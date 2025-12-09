"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function StudySessionPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/library/${params.id}`)
      if (!response.ok) throw new Error("Item not found")
      const data = await response.json()
      setItem(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load study item",
        variant: "destructive",
      })
      router.push("/study")
    }
  }

  const handleNext = () => {
    if (item.type === "QUIZ" && selectedAnswer !== null) {
      const question = item.payload.questions[currentIndex]
      if (selectedAnswer === question.correctAnswer) {
        setScore(score + 1)
      }
    }

    if (currentIndex < (item.type === "QUIZ" ? item.payload.questions.length : item.payload.cards.length) - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setSelectedAnswer(null)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    if (item.type === "QUIZ") {
      const total = item.payload.questions.length
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          library_item_id: item.id,
          score,
          total,
          answers: [],
        }),
      })
    }
    setCompleted(true)
  }

  if (!item) {
    return <div>Loading...</div>
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Study Complete!</h2>
            {item.type === "QUIZ" && (
              <div>
                <p className="text-lg">
                  Score: {score} / {item.payload.questions.length}
                </p>
                <p className="text-muted-foreground">
                  {Math.round((score / item.payload.questions.length) * 100)}%
                </p>
              </div>
            )}
            <Button onClick={() => router.push("/study")}>Back to Study Hub</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (item.type === "FLASHCARDS") {
    const card = item.payload.cards[currentIndex]
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardContent className="pt-6 min-h-[300px] flex flex-col justify-center">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {item.payload.cards.length}
              </div>
              <div className="text-2xl font-semibold">{card.front}</div>
              {showAnswer && (
                <div className="mt-8 text-lg text-muted-foreground border-t pt-4">
                  {card.back}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          {!showAnswer ? (
            <Button onClick={() => setShowAnswer(true)} className="flex-1">
              Show Answer
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleNext} className="flex-1">
                Next
              </Button>
              <Button
                onClick={async () => {
                  await fetch("/api/flashcards/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      set_id: item.id,
                      card_key: String(currentIndex),
                      box_level: 1,
                    }),
                  })
                  handleNext()
                }}
                className="flex-1"
              >
                Got it
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (item.type === "QUIZ") {
    const question = item.payload.questions[currentIndex]
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-4">
              Question {currentIndex + 1} of {item.payload.questions.length}
            </div>
            <div className="text-xl font-semibold mb-6">{question.question}</div>
            <div className="space-y-2">
              {question.options.map((opt: string, i: number) => (
                <Button
                  key={i}
                  variant={selectedAnswer === i ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer(i)}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </Button>
              ))}
            </div>
            {showAnswer && (
              <div className="mt-4 p-4 bg-muted rounded">
                <div className="font-semibold">
                  Correct answer: {String.fromCharCode(65 + question.correctAnswer)}
                </div>
                {question.explanation && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {question.explanation}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex gap-2">
          {!showAnswer && selectedAnswer !== null ? (
            <Button onClick={() => setShowAnswer(true)} className="flex-1">
              Check Answer
            </Button>
          ) : showAnswer ? (
            <Button onClick={handleNext} className="flex-1">
              {currentIndex < item.payload.questions.length - 1 ? "Next" : "Finish"}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return null
}

