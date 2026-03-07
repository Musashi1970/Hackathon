import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarDays } from "lucide-react"

export function CTASection({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] px-8 py-16 text-center sm:px-16 lg:py-24">
          {/* Decorative */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-balance text-3xl font-bold text-background sm:text-4xl">
              Start using AI to increase your restaurant revenue
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-background/70 leading-relaxed">
              Join hundreds of restaurants already using Petpooja Vani to automate orders, optimize menus, and boost profits.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 px-8 bg-brand text-brand-foreground hover:bg-brand/90" onClick={onSignIn}>
                  Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-background/20 bg-transparent px-8 text-background hover:bg-background/10 hover:text-background">
                <CalendarDays className="h-4 w-4" /> Book Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
