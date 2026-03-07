import { Phone, Bot, TrendingUp, Send } from "lucide-react"

const steps = [
  {
    icon: Phone,
    step: "01",
    title: "Customer Calls Restaurant",
    description: "A customer dials your restaurant number. The AI voice assistant picks up instantly — no missed calls, no wait time.",
  },
  {
    icon: Bot,
    step: "02",
    title: "AI Voice Assistant Takes Order",
    description: "The AI greets the customer, understands their order in English or Hindi, and confirms each item accurately.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "AI Suggests Upsells in Real-Time",
    description: "Smart upsell suggestions like \"Would you like Medu Vada with your Masala Dosa?\" — increasing average order value.",
  },
  {
    icon: Send,
    step: "04",
    title: "Order Pushed to POS",
    description: "The structured order is instantly sent to your POS system and kitchen display. No manual entry required.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            How It Works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            From phone call to kitchen in seconds
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
            Petpooja Vani automates the entire phone order workflow so your staff can focus on what matters — great food and service.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-1/2 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <item.icon className="h-8 w-8" />
              </div>
              <span className="mt-4 text-sm font-bold text-brand">Step {item.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
