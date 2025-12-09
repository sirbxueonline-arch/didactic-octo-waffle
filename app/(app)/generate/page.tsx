"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

type GenerationType = "EXPLAIN" | "FLASHCARDS" | "QUIZ" | "PLAN"

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") || "explain") as string
  const [activeTab, setActiveTab] = useState<GenerationType>(
    initialTab === "quiz" ? "QUIZ" :
    initialTab === "flashcards" ? "FLASHCARDS" :
    initialTab === "plan" ? "PLAN" : "EXPLAIN"
  )
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [language, setLanguage] = useState("en")
  const [amount, setAmount] = useState(10)
  const [advanced, setAdvanced] = useState(false)
  const [examMode, setExamMode] = useState(false)
  const [explanationStyle, setExplanationStyle] = useState<"simple" | "detailed" | "teacher">("detailed")
  const [hintMode, setHintMode] = useState(true)
  const [commonMistakesFocus, setCommonMistakesFocus] = useState(false)
  const [addMiniReview, setAddMiniReview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          topic,
          difficulty,
          language,
          amount,
          examMode: advanced ? examMode : false,
          explanationStyle: advanced ? explanationStyle : "detailed",
          hintMode: advanced ? hintMode : true,
          commonMistakesFocus: advanced ? commonMistakesFocus : false,
          addMiniReview: advanced ? addMiniReview : false,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast({
          title: "Cancelled",
          description: "Generation was cancelled",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate content",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleSave = async () => {
    if (!result) return

    setSaving(true)
    try {
      const response = await fetch("/api/library/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: result.type,
          title: result.content.title,
          subject: null,
          tags: [],
          payload: result.content,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.code === "RESOURCE_LIMIT") {
          toast({
            title: "Limit reached",
            description: `You've reached your monthly limit of ${data.limit} resources.`,
            variant: "destructive",
          })
        } else {
          throw new Error(data.error || "Failed to save")
        }
      } else {
        toast({
          title: "Saved",
          description: "Content saved to your library",
        })
        setResult(null)
        setTopic("")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Content</h1>
        <p className="text-muted-foreground mt-2">
          Create study materials with AI assistance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Studio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GenerationType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="EXPLAIN">Explain</TabsTrigger>
              <TabsTrigger value="FLASHCARDS">Flashcards</TabsTrigger>
              <TabsTrigger value="QUIZ">Quiz</TabsTrigger>
              <TabsTrigger value="PLAN">Study Plan</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, World War II, Calculus"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(activeTab === "FLASHCARDS" || activeTab === "QUIZ") && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      max="50"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 10)}
                    />
                  </div>
                )}

                <Collapsible open={advanced} onOpenChange={setAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      Advanced Options
                      <span>{advanced ? "−" : "+"}</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Exam Mode</Label>
                      <Switch checked={examMode} onCheckedChange={setExamMode} />
                    </div>
                    <div className="space-y-2">
                      <Label>Explanation Style</Label>
                      <Select value={explanationStyle} onValueChange={(v: any) => setExplanationStyle(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Hint Mode</Label>
                      <Switch checked={hintMode} onCheckedChange={setHintMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Common Mistakes Focus</Label>
                      <Switch checked={commonMistakesFocus} onCheckedChange={setCommonMistakesFocus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Add Mini-Review Questions</Label>
                      <Switch checked={addMiniReview} onCheckedChange={setAddMiniReview} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex gap-2">
                  {loading ? (
                    <>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel
                      </Button>
                      <Button disabled className="flex-1">
                        Generating...
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleGenerate} className="flex-1">
                      Generate
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{result.content.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.type === "EXPLAIN" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Explanation</h3>
                      <p className="text-muted-foreground">{result.content.explanation}</p>
                    </div>
                    {result.content.keyPoints && (
                      <div>
                        <h3 className="font-semibold mb-2">Key Points</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {result.content.keyPoints.map((point: string, i: number) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.type === "FLASHCARDS" && (
                  <div className="space-y-2">
                    {result.content.cards?.map((card: any, i: number) => (
                      <div key={i} className="border rounded p-4">
                        <div className="font-semibold mb-2">Q: {card.front}</div>
                        <div className="text-muted-foreground">A: {card.back}</div>
                      </div>
                    ))}
                  </div>
                )}

                {result.type === "QUIZ" && (
                  <div className="space-y-4">
                    {result.content.questions?.map((q: any, i: number) => (
                      <div key={i} className="border rounded p-4">
                        <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                        <ul className="space-y-1 ml-4">
                          {q.options.map((opt: string, j: number) => (
                            <li key={j} className="text-muted-foreground">
                              {String.fromCharCode(65 + j)}. {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {result.type === "PLAN" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Duration: {result.content.duration}</h3>
                    </div>
                    {result.content.goals && (
                      <div>
                        <h3 className="font-semibold mb-2">Goals</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {result.content.goals.map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save to Library"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

