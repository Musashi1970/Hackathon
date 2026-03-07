"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface TranscriptMessage {
  role: "Customer" | "Assistant"
  time: string
  text: string
}

export interface TranscriptBoxProps {
  messages: TranscriptMessage[]
  maxHeight?: string
  className?: string
}

export function TranscriptBox({ messages, maxHeight = "400px", className }: TranscriptBoxProps) {
  return (
    <ScrollArea className={cn("rounded-lg border border-border bg-muted/30", className)} style={{ maxHeight }}>
      <div className="flex flex-col gap-3 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-1 max-w-[85%]",
              message.role === "Customer" ? "self-start" : "self-end"
            )}
          >
            {/* Role & Time Header */}
            <div
              className={cn(
                "flex items-center gap-2 text-xs",
                message.role === "Customer" ? "justify-start" : "justify-end"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  message.role === "Customer" ? "text-muted-foreground" : "text-[#CF1F2E]"
                )}
              >
                {message.role}
              </span>
              <span className="text-muted-foreground">{message.time}</span>
            </div>

            {/* Message Bubble */}
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                message.role === "Customer"
                  ? "rounded-tl-sm bg-background border border-border text-foreground"
                  : "rounded-tr-sm bg-[#CF1F2E] text-white"
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// Example usage with sample data
export const sampleTranscript: TranscriptMessage[] = [
  { role: "Assistant", time: "12:30 PM", text: "Hello! Welcome to Raj's Kitchen. How can I help you today?" },
  { role: "Customer", time: "12:31 PM", text: "Can I get one masala dosa?" },
  { role: "Assistant", time: "12:31 PM", text: "Sure! One Classic Masala Dosa. Would you like to add a Filter Coffee for just ₹50? It pairs perfectly with the dosa." },
  { role: "Customer", time: "12:32 PM", text: "Yes, add the coffee please." },
  { role: "Assistant", time: "12:32 PM", text: "Great choice! Your order is: 1 Classic Masala Dosa (₹70) and 1 Authentic Filter Coffee (₹50). Total is ₹120. Shall I confirm?" },
  { role: "Customer", time: "12:32 PM", text: "Yes, confirm it." },
  { role: "Assistant", time: "12:33 PM", text: "Perfect! Your order #1234 has been placed. It will be ready in approximately 12 minutes. Thank you for ordering!" },
]
