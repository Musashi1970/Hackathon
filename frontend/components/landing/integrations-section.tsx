import { Monitor, Truck, ChefHat, CreditCard, Smartphone, Printer } from "lucide-react"

const integrations = [
  { icon: Monitor, name: "POS Systems", description: "Petpooja, POSist, Rista, and more" },
  { icon: Truck, name: "Delivery Apps", description: "Swiggy, Zomato, Dunzo" },
  { icon: ChefHat, name: "Kitchen Displays", description: "KOT printers and KDS screens" },
  { icon: CreditCard, name: "Payment Gateways", description: "Razorpay, Paytm, PhonePe" },
  { icon: Smartphone, name: "Ordering Apps", description: "Thrive, DotPe, Restajet" },
  { icon: Printer, name: "Billing Systems", description: "GST-compliant billing software" },
]

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20 lg:py-32 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Integrations
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Connects with the tools you already use
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
            Petpooja Vani integrates seamlessly with popular POS systems, delivery platforms, and kitchen display systems in India.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:shadow-foreground/5"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <integration.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
