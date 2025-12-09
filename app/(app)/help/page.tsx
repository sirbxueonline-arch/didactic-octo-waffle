"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function HelpPage() {
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          message: feedback,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit")

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted",
      })
      setFeedback("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers and get help
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I generate content?</AccordionTrigger>
              <AccordionContent>
                Go to the Generate page, select a tool (Explain, Flashcards, Quiz, or Study Plan),
                enter your topic, adjust settings, and click Generate. The content will appear
                and you can save it to your library.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is the monthly limit?</AccordionTrigger>
              <AccordionContent>
                You can save up to 20 resources per month. Generation is free and unlimited,
                but saving content to your library consumes 1 resource from your monthly limit.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does spaced repetition work?</AccordionTrigger>
              <AccordionContent>
                When studying flashcards, the system uses the Leitner method. Cards you know
                well move to higher boxes and appear less frequently, while cards you struggle
                with appear more often until you master them.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I export my content?</AccordionTrigger>
              <AccordionContent>
                Yes! On any library item detail page, you can export the content as JSON.
                PDF export is coming soon.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
          <CardDescription>We&apos;d love to hear from you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="help-feedback">Your message</Label>
            <Textarea
              id="help-feedback"
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </div>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </CardContent>
      </Card>
    </div>
  )
}

