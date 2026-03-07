"use client"

import { useState } from "react"
import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { IntegrationsSection } from "@/components/landing/integrations-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { LoginModal } from "@/components/landing/login-modal"

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <main className="min-h-screen">
      <Navbar onSignIn={() => setShowLogin(true)} />
      <HeroSection onSignIn={() => setShowLogin(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <CTASection onSignIn={() => setShowLogin(true)} />
      <Footer />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  )
}
