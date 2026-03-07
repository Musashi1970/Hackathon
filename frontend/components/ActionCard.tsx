"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Check, AlertTriangle, TrendingUp, Sparkles } from "lucide-react"

export interface ActionCardProps {
  title: string
  problem: string
  suggestedAction: string
  expectedProfit: string
  profitDetail?: string
  icon?: React.ReactNode
  deployed?: boolean
  onDeploy?: () => void
}

export function ActionCard({
  title,
  problem,
  suggestedAction,
  expectedProfit,
  profitDetail,
  icon,
  deployed = false,
  onDeploy,
}: ActionCardProps) {
  const [isDeployed, setIsDeployed] = useState(deployed)

  const handleDeploy = () => {
    setIsDeployed(true)
    onDeploy?.()
  }

  return (
    <Card
      className={`rounded-xl border transition-all hover:shadow-md ${
        isDeployed
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-border bg-card"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CF1F2E]/10">
              {icon || <Sparkles className="h-5 w-5 text-[#CF1F2E]" />}
            </div>
            <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          </div>
          {isDeployed && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <Check className="mr-1 h-3 w-3" />
              Deployed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Problem */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Problem / Opportunity
              </div>
              <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">{problem}</p>
            </div>
          </div>
        </div>

        {/* Suggested Action */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
                Suggested Action
              </div>
              <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{suggestedAction}</p>
            </div>
          </div>
        </div>

        {/* Expected Profit */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Expected Profit
              </div>
              <p className="mt-1 text-lg font-bold text-emerald-600">{expectedProfit}</p>
              {profitDetail && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{profitDetail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        {isDeployed ? (
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
            disabled
          >
            <Check className="h-4 w-4" />
            Deployed to Voice Assistant
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full gap-2 bg-[#CF1F2E] hover:bg-[#B01A26] text-white"
            onClick={handleDeploy}
          >
            <Send className="h-4 w-4" />
            Deploy to Voice Assistant
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
