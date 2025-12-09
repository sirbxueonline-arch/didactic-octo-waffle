export type GenerationType = "EXPLAIN" | "FLASHCARDS" | "QUIZ" | "PLAN"

export interface GenerationRequest {
  type: GenerationType
  topic: string
  difficulty?: "easy" | "medium" | "hard"
  language?: string
  amount?: number
  subject?: string
  examMode?: boolean
  explanationStyle?: "simple" | "detailed" | "teacher"
  hintMode?: boolean
  commonMistakesFocus?: boolean
  addMiniReview?: boolean
}

export interface GenerationResponse {
  content: any
  type: GenerationType
}

// Mock provider (default)
export async function generateMock(request: GenerationRequest): Promise<GenerationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate delay

  const { type, topic, difficulty = "medium", amount = 10 } = request

  switch (type) {
    case "EXPLAIN":
      return {
        type: "EXPLAIN",
        content: {
          title: `Explanation: ${topic}`,
          explanation: `This is a ${difficulty} explanation of ${topic}. In this topic, we explore the fundamental concepts and their applications. The key points include understanding the core principles, recognizing patterns, and applying knowledge to solve problems.`,
          keyPoints: [
            `Key concept 1 related to ${topic}`,
            `Key concept 2 related to ${topic}`,
            `Key concept 3 related to ${topic}`,
          ],
          examples: [
            {
              question: `Example question about ${topic}?`,
              answer: `This is how you would approach this example.`,
            },
          ],
        },
      }

    case "FLASHCARDS":
      const cards = Array.from({ length: amount }, (_, i) => ({
        front: `Question ${i + 1} about ${topic}`,
        back: `Answer ${i + 1} explaining the concept related to ${topic}`,
      }))
      return {
        type: "FLASHCARDS",
        content: {
          title: `Flashcards: ${topic}`,
          cards,
        },
      }

    case "QUIZ":
      const questions = Array.from({ length: amount }, (_, i) => ({
        question: `Question ${i + 1} about ${topic}?`,
        options: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ],
        correctAnswer: 0,
        explanation: `Explanation for question ${i + 1}`,
      }))
      return {
        type: "QUIZ",
        content: {
          title: `Quiz: ${topic}`,
          questions,
        },
      }

    case "PLAN":
      return {
        type: "PLAN",
        content: {
          title: `Study Plan: ${topic}`,
          duration: "2 weeks",
          goals: [
            `Understand the basics of ${topic}`,
            `Practice key concepts`,
            `Review and test knowledge`,
          ],
          schedule: [
            {
              day: 1,
              tasks: [`Introduction to ${topic}`, `Read chapter 1`],
            },
            {
              day: 2,
              tasks: [`Practice exercises`, `Review notes`],
            },
          ],
        },
      }

    default:
      throw new Error("Invalid generation type")
  }
}

// Real provider (OpenAI)
export async function generateOpenAI(request: GenerationRequest): Promise<GenerationResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured")
  }

  const { type, topic, difficulty = "medium", amount = 10 } = request

  const systemPrompt = `You are an expert educational assistant. Generate high-quality educational content.`
  
  let userPrompt = ""
  switch (type) {
    case "EXPLAIN":
      userPrompt = `Create a detailed explanation of "${topic}" at ${difficulty} level.`
      break
    case "FLASHCARDS":
      userPrompt = `Create ${amount} flashcards about "${topic}". Format as JSON with front/back pairs.`
      break
    case "QUIZ":
      userPrompt = `Create ${amount} multiple-choice questions about "${topic}" at ${difficulty} level.`
      break
    case "PLAN":
      userPrompt = `Create a study plan for "${topic}".`
      break
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error("OpenAI API error")
  }

  const data = await response.json()
  const content = JSON.parse(data.choices[0].message.content)

  return {
    type,
    content,
  }
}

// Real provider (Gemini)
export async function generateGemini(request: GenerationRequest): Promise<GenerationResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const { type, topic, difficulty = "medium", amount = 10 } = request

  let prompt = ""
  switch (type) {
    case "EXPLAIN":
      prompt = `Create a detailed explanation of "${topic}" at ${difficulty} level. Include key points and examples. Return as JSON with: {title: string, explanation: string, keyPoints: string[], examples: [{question: string, answer: string}]}`
      break
    case "FLASHCARDS":
      prompt = `Create ${amount} flashcards about "${topic}". Return as JSON with: {title: string, cards: [{front: string, back: string}]}`
      break
    case "QUIZ":
      prompt = `Create ${amount} multiple-choice questions about "${topic}" at ${difficulty} level. Return as JSON with: {title: string, questions: [{question: string, options: [string, string, string, string], correctAnswer: number (0-3), explanation: string}]}`
      break
    case "PLAN":
      prompt = `Create a study plan for "${topic}". Return as JSON with: {title: string, duration: string, goals: string[], schedule: [{day: number, tasks: string[]}]}`
      break
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert educational assistant. ${prompt} Return only valid JSON, no markdown formatting.`,
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  
  // Clean up the response (remove markdown code blocks if present)
  const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const content = JSON.parse(cleanedText)

  return {
    type,
    content,
  }
}

// Main generator function
export async function generate(request: GenerationRequest): Promise<GenerationResponse> {
  const provider = process.env.AI_PROVIDER || "mock"

  switch (provider) {
    case "openai":
      return generateOpenAI(request)
    case "gemini":
      return generateGemini(request)
    case "mock":
    default:
      return generateMock(request)
  }
}

