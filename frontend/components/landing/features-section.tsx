import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Brain, DollarSign, Boxes, LayoutDashboard, Globe } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "AI Voice Ordering",
    description: "AI answers phone calls, takes orders automatically, and supports multiple Indian languages including Hindi, Tamil, and more.",
  },
  {
    icon: Brain,
    title: "Menu Intelligence",
    description: "Identify high-margin but low-selling items, detect underperforming SKUs, and classify items by profitability and popularity.",
  },
  {
    icon: DollarSign,
    title: "AI Price Optimization",
    description: "Suggest optimal menu prices using demand data and competitor analysis. Predict revenue impact before making changes.",
  },
  {
    icon: Boxes,
    title: "Smart Combo Builder",
    description: "AI suggests combos to increase average order value. One-click publish to POS and voice assistant simultaneously.",
  },
  {
    icon: LayoutDashboard,
    title: "Real-Time Order Management",
    description: "View live orders, track kitchen preparation status, and manage the full order lifecycle from a single dashboard.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Voice assistant speaks English, Hindi, and regional languages. Customers can order in the language they are most comfortable with.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Features
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to automate your restaurant
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
            From voice ordering to menu analytics, Petpooja Vani gives you the AI tools to boost revenue and reduce operational overhead.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group border-border bg-card transition-all hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-1">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4 text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
