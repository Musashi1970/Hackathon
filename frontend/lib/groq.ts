import { getSalesSummary } from "@/data/salesData"

const SYSTEM_PROMPT = `You are the AI Pricing & Sales Analyst for "Raj's Kitchen", a South Indian restaurant. You have full access to the restaurant's real-time sales data provided below.

Your capabilities:
1. Analyze item-level profitability (revenue, cost, margin, profit)
2. Identify underperforming items (declining sales, high returns, low ratings)
3. Recommend price changes with mathematical justification
4. Spot demand-inelastic items where price can be raised without hurting volume
5. Suggest combo/bundling strategies to move slow items
6. Forecast revenue impact of proposed price changes

Rules:
- Always ground your answers in the actual data. Cite specific numbers.
- When recommending a price change, show: current price → proposed price, expected volume impact, and net revenue/profit change.
- Keep responses concise and actionable — this is for a busy restaurant owner.
- Use ₹ for currency.
- Format numbers clearly (e.g., ₹1,42,000 for Indian numbering or ₹142,000).
- If asked about something outside your data, say so honestly.

${getSalesSummary()}`

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function chatWithGroq(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || "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"
  if (!apiKey) {
    return "Groq API key is not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment."
  }

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.4,
    max_tokens: 1024,
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? "No response from AI."
}
