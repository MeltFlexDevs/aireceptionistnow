export default function Home() {
  return (
    <main className="flex flex-col min-h-screen font-[var(--font-geist)]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold text-gray-900">AI Receptionist</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <a
            href="#pricing"
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>12,000+ businesses already use AI Receptionist</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Never Miss a{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Business Call</span>
              <span className="absolute inset-x-0 bottom-1 h-4 bg-yellow-200 -z-0 -rotate-1 rounded"></span>
            </span>{" "}
            Again
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your AI receptionist answers calls, books appointments, and handles
            customers 24/7 — so you can focus on your work. Set up in under 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#pricing"
              className="bg-black text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-gray-800 transition-colors"
            >
              Start Free Trial →
            </a>
            <a
              href="#how-it-works"
              className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              See How It Works
            </a>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-gray-100 pt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-500 mt-1">Always available</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-3xl font-bold text-gray-900">4.9★</div>
              <div className="text-sm text-gray-500 mt-1">Average rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10 min</div>
              <div className="text-sm text-gray-500 mt-1">Setup time</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO CHAT */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-sm border border-gray-100">
                <p className="text-gray-800 text-sm leading-relaxed">
                  &ldquo;Hello! You&apos;ve reached Dr. Smith&apos;s dental office. I&apos;m your AI assistant — I can book an appointment, answer questions, or connect you to our team. How can I help?&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 flex-row-reverse">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-700 text-xs font-bold">C</span>
              </div>
              <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm max-w-sm">
                <p className="text-white text-sm leading-relaxed">
                  &ldquo;I&apos;d like to book a cleaning for next Tuesday morning.&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-6">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-sm border border-gray-100">
                <p className="text-gray-800 text-sm leading-relaxed">
                  &ldquo;Perfect! I have Tuesday at 9:00 AM and 10:30 AM available. Which works better? I&apos;ll send a confirmation to your phone right away.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-8 font-medium">
            Trusted by businesses in every industry
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-gray-400 font-medium text-sm">
            {[
              "Dental Clinics",
              "Law Firms",
              "Auto Dealers",
              "Hotels",
              "Tradespeople",
              "Medical Practices",
              "Real Estate",
              "Restaurants",
            ].map((industry) => (
              <span key={industry} className="hover:text-gray-700 transition-colors">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything your receptionist does — automated
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your AI handles the full call flow so customers always get a professional experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "📞",
                title: "Answers Every Call",
                desc: "No more missed calls or voicemail. Your AI picks up instantly, 24/7, including weekends and holidays.",
              },
              {
                icon: "📅",
                title: "Books Appointments",
                desc: "Integrates with your calendar and books meetings during the call — no back-and-forth needed.",
              },
              {
                icon: "🔀",
                title: "Smart Call Routing",
                desc: "Routes complex calls to the right team member. Handles simple ones on its own.",
              },
              {
                icon: "📝",
                title: "Call Transcripts",
                desc: "Every call is transcribed and summarized. Get an email recap after each conversation.",
              },
              {
                icon: "🌍",
                title: "Multi-Language",
                desc: "Speaks 30+ languages fluently. Serve customers in their native language automatically.",
              },
              {
                icon: "🔗",
                title: "CRM Integration",
                desc: "Connects with HubSpot, Salesforce, Google Calendar, and more via native integrations.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Set up in 3 simple steps</h2>
            <p className="text-lg text-gray-500">No coding. No technical skills required.</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Tell us about your business",
                desc: "Describe your business, services, and how you want calls handled. Takes about 5 minutes.",
              },
              {
                step: "02",
                title: "Get your AI phone number",
                desc: "We give you a local phone number — or forward your existing number to your AI receptionist.",
              },
              {
                step: "03",
                title: "Start taking calls",
                desc: "Your AI is live immediately. Customers call, the AI handles it, you get a summary.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="text-5xl font-bold text-gray-100 leading-none shrink-0 w-16 text-right">
                  {s.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Businesses love AI Receptionist
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "My AI receptionist saves me the equivalent of a full-time employee. Every call is answered perfectly, even at 2am.",
                name: "Martin K.",
                role: "Owner, Auto Repair Shop",
              },
              {
                quote:
                  "We were missing 30% of calls during busy hours. Now we capture every lead. Revenue up 22% in 3 months.",
                name: "Dr. Jana P.",
                role: "Dental Practice Owner",
              },
              {
                quote:
                  "Set it up in 8 minutes. Our customers can't tell it's AI. The booking integration is flawless.",
                name: "Tomáš R.",
                role: "Hotel Manager",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when you need more. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                desc: "Perfect for small businesses getting started",
                features: [
                  "100 calls / month",
                  "Appointment booking",
                  "Email summaries",
                  "1 phone number",
                  "5 languages",
                ],
                cta: "Start Free Trial",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$79",
                period: "/month",
                desc: "For growing businesses with high call volume",
                features: [
                  "500 calls / month",
                  "Everything in Starter",
                  "CRM integration",
                  "3 phone numbers",
                  "30+ languages",
                  "Call routing",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                highlight: true,
              },
              {
                name: "Business",
                price: "$199",
                period: "/month",
                desc: "For teams and multi-location businesses",
                features: [
                  "Unlimited calls",
                  "Everything in Pro",
                  "Custom voice & persona",
                  "10 phone numbers",
                  "API access",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-4">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className={`font-semibold text-sm mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className={plan.highlight ? "text-green-400" : "text-green-600"}>✓</span>
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                    plan.highlight
                      ? "bg-white text-black hover:bg-gray-100"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-black rounded-3xl px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Start answering every call today</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join 12,000+ businesses that never miss a call. Set up in 10 minutes. First 14 days free.
          </p>
          <a
            href="#pricing"
            className="inline-block bg-white text-black font-semibold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-colors"
          >
            Start Free Trial →
          </a>
          <p className="text-gray-600 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">AI Receptionist</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 AI Receptionist Now. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
