export const landingPage = {
  contact: {
    whatsapp: {
      display: "+62 881-0806-19084",
      phone: "62881080619084",
    },
    email: {
      display: "diuk.solution@gmail.com",
      href: "mailto:diuk.solution@gmail.com",
    },
    instagram: {
      display: "@diuk.solution",
      href: "https://www.instagram.com/diuk.solution",
    },
  },
  header: {
    logo: {
      src: "/logo.webp",
      alt: "DIUK Solution Logo",
      href: "#",
    },
    navItems: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Product", href: "#product" },
      { label: "Solutions", href: "#solutions" },
      { label: "Pricing", href: "#pricing" },
    ],
    login: { label: "Login", href: "/login" },
    cta: { label: "Get Started", href: "#pricing" },
  },
  hero: {
    badge: "DIUK Solution • Conversational Commerce",
    brand: "DIUK",
    headline: "Turn Every Customer Conversation Into a",
    headlineAccent: "Transaction.",
    subtitle:
      "AI-powered customer conversations, sales, and reservations for growing businesses.",
    primaryCta: { label: "Get Started", href: "#pricing" },
    secondaryCta: { label: "See How It Works", href: "#how-it-works" },
    footnote: "Built for businesses that run on customer conversations.",
    signals: [
      { icon: "bolt", label: "1.1s avg reply" },
      { icon: "forum", label: "WA + Instagram" },
      { icon: "event_available", label: "Auto reservation" },
    ],
    simulation: {
      title: "diuksolution/chat // Live Dispatch",
      latency: "1.1s latency",
      version: "v2.4-stable",
    },
  },
  brands: {
    label: "Trusted by businesses that run on customer conversations",
    logos: [
      { name: "Hai Banana", src: "/brands/haibanana.webp" },
      { name: "Kasiko Coffee", src: "/brands/kasikocoffee.webp" },
      { name: "Terra Furniture Lab", src: "/brands/terra.webp" },
      { name: "Lebih Asri", src: "/brands/lebak.webp" },
      { name: "Desa Wisata Alamendah", src: "/brands/dawala.webp" },
      { name: "Buana Medika Jaya", src: "/brands/buana.webp" },
    ],
  },
  trust: {
    label: "Built for businesses that run on customer conversations",
    industries: [
      { icon: "spa", label: "Beauty & Aesthetic Clinics" },
      { icon: "content_cut", label: "Modern Barbershops" },
      { icon: "restaurant", label: "Bistros & Dining" },
      { icon: "fitness_center", label: "Boutique Fitness Studios" },
      { icon: "hotel", label: "Hospitality & Resorts" },
      { icon: "calendar_month", label: "Appointment Services" },
    ],
  },
  problem: {
    eyebrow: "The messy part",
    title: "The chats keep coming. The bookings don't.",
    description:
      "Most teams still run WhatsApp, a spreadsheet, and whoever happens to be holding the phone.",
    items: [
      {
        number: "01",
        title: "Replies come too late",
        description:
          "Someone asks if there's a slot. Two hours later they have already booked somewhere else.",
        kind: "chat" as const,
      },
      {
        number: "02",
        title: "Leads hide in unread chats",
        description:
          "The useful ones sit under greetings, location pins, and “kak masih buka?”",
        kind: "inbox" as const,
      },
      {
        number: "03",
        title: "Reservations live in a spreadsheet",
        description:
          "Two people take the same Saturday slot because nothing locked it in real time.",
        kind: "sheet" as const,
      },
    ],
  },
  workflow: {
    id: "how-it-works",
    eyebrow: "How it works",
    title: "One chat. From “masih ada slot?” to a locked table.",
    description:
      "DIUK reads the message, finds the guest, books the slot, and tells the floor.",
    steps: [
      {
        step: "01",
        stage: "Inbox",
        label: "Customer writes in",
        icon: "chat",
        highlight: false,
        lines: [
          { kind: "meta" as const, text: "WhatsApp · Sinta" },
          {
            kind: "body" as const,
            text: "Mau reservasi meja 4 orang, besok malam jam 7.",
          },
        ],
      },
      {
        step: "02",
        stage: "Reading",
        label: "Request is understood",
        icon: "psychology",
        highlight: false,
        lines: [
          { kind: "success" as const, text: "4 guests" },
          { kind: "body" as const, text: "Tomorrow · 19:00" },
          { kind: "meta" as const, text: "Read in 0.8s" },
        ],
      },
      {
        step: "03",
        stage: "Guest",
        label: "Profile comes up",
        icon: "person_search",
        highlight: false,
        lines: [
          { kind: "strong" as const, text: "Sinta · regular" },
          { kind: "meta" as const, text: "Usually window table" },
          { kind: "chip" as const, text: "Known guest" },
        ],
      },
      {
        step: "04",
        stage: "Booking",
        label: "Table is locked",
        icon: "event_available",
        highlight: false,
        lines: [
          { kind: "success" as const, text: "Table 12 held" },
          { kind: "body" as const, text: "QRIS deposit sent" },
          { kind: "chip-success" as const, text: "Confirmed" },
        ],
      },
      {
        step: "05",
        stage: "Floor",
        label: "The floor is told",
        icon: "sync_alt",
        highlight: true,
        lines: [
          { kind: "strong" as const, text: "Kitchen & host notified" },
          { kind: "meta" as const, text: "Table 12 · 19:00" },
          { kind: "chip-invert" as const, text: "On the board" },
        ],
      },
    ],
  },
  features: {
    id: "product",
    eyebrow: "Product Capabilities",
    title: "Everything your team needs to turn conversations into growth.",
    description:
      "Engineered for high-volume conversational commerce and appointment businesses.",
    modules: [
      {
        module: "Module 01",
        title: "AI Customer Service",
        description:
          "Handles Indonesian slang, colloquial questions, pricing, and operating hours instantly. No rigid decision trees.",
        icon: "smart_toy",
        accent: "green" as const,
        stats: [
          { icon: "bolt", label: "1.2s auto-reply", accent: true },
          { icon: "translate", label: "Bahasa Gaul + Formal", accent: false },
        ],
        reverse: false,
        kind: "chat" as const,
      },
      {
        module: "Module 02",
        title: "Smart Reservation & Calendar",
        description:
          "Locks schedules in real-time. Automatically checks practitioner rosters, rooms, and chairs to eliminate overbooking completely.",
        icon: "calendar_month",
        accent: "navy" as const,
        stats: [
          { icon: "sync", label: "2-way Google Cal", accent: true },
          {
            icon: "notifications",
            label: "Auto WhatsApp Reminders",
            accent: false,
          },
        ],
        reverse: true,
        kind: "calendar" as const,
      },
      {
        module: "Module 03",
        title: "Lead Pipeline & Conversational CRM",
        description:
          "Watch raw conversations transition into structured revenue. Leads move automatically across the sales stages with transaction tags.",
        icon: "account_tree",
        accent: "teal" as const,
        stats: [
          { icon: "filter_alt", label: "Auto-tagging", accent: true },
          { icon: "payments", label: "Realized IDR values", accent: false },
        ],
        reverse: false,
        kind: "pipeline" as const,
      },
    ],
  },
  solutions: {
    id: "solutions",
    eyebrow: "Industry Solutions",
    title: "Built around how your business works.",
    description:
      "Different businesses. Different conversations. One intelligent platform.",
    cards: [
      {
        icon: "spa",
        title: "Beauty & Aesthetic Clinics",
        badge: "+41% Utilization",
        badgeTone: "emerald" as const,
        description:
          "Turn inquiries into confirmed doctor appointments & treatments.",
        metaLabel: "WA Booking Confirmation:",
        metaValue: "dr. Nadia (16:00 Locked)",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAIFzL-5KEq_fiiuk0IyTEP-8KDHDFSGPRFGzpHr6kA8cQAG1xcz428y9JcaJJ0nXX2fy7MwvJdpE5Iwn1chfV6VK5ImXWNau8QWTWne_E14dMFW9X-KSMMjVSXsS-26Fy_Tz0CPlqAyS-hyLdjtNo-logeZyDB3zDMGvS7iZ6fgcxj_fbrehjcpA_x3XZm9P8l8wKLSKXjeFb0pH9XrE0mBvYrDvl3i6sNDl6Zwwy6XUpCHXllyqmu",
        imageAlt: "Modern luxury aesthetic beauty clinic interior",
      },
      {
        icon: "content_cut",
        title: "Modern Barbershops",
        badge: "Zero Overbooking",
        badgeTone: "teal" as const,
        description: "Zero missed chair slots during busy weekend peak hours.",
        metaLabel: "Barber Availability:",
        metaValue: "Yoga • Chair 2 Available",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAyZrBuA8kgkRoA0HkcxMWaWmKyc7y7YlZqwjOsKrZzaIgXksFtsSwut-VoMM9FuGmNMFvY2ulYVuaRuPzEx05S3zTM9_iqh38auHhbSZ-gBT_7FluDlbIm44AzQ4Re1tAbgXGrQUoPwGP_U7-ztg94q2tGPVTjk2wV8IWC8wOj6qPIUO_A2e5n5_3X7xFZvsHqlVCgRX45QRC5GliT38T1VYxrFu-OtkBWq-2e3XmHTXBjVvzztwD-",
        imageAlt: "Upscale modern barbershop interior",
      },
      {
        icon: "restaurant",
        title: "Bistros & Dining",
        badge: "Auto-Deposit",
        badgeTone: "amber" as const,
        description:
          "Automated table reservations & dietary notes via WhatsApp.",
        metaLabel: "Table #12 (4 Pax):",
        metaValue: "QRIS DP Confirmed Rp 200k",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCF6wmwmzovOZVAjNr-XfdwJfAycUoQiC6Q21nYck3PFfqjolWKAZFMXMPLs-tYC1RzkpPZv7CJEd-OKhnI4gL6tGIn-Eh2eFf4v9owxv0zXECG5Jcy94iQOT1XCuauQh3ue7y_kPbd9YdzdrGSpVpajZTYO4ZUHg9QzXPaGtAWXYDrOF8uCfxGPX1BYmFhwSi-_pHiY6CaTK12cBxCVx8hLD8J0zwEx9R6bm8YVy7dSegqKjKWkY7j",
        imageAlt: "Contemporary chic bistro restaurant dining area",
      },
      {
        icon: "sports_gymnastics",
        title: "Gyms & Studios",
        badge: "+28% Renewals",
        badgeTone: "blue" as const,
        description: "Class bookings & membership renewals directly on WhatsApp.",
        metaLabel: "Reformer Pilates:",
        metaValue: "Trainer Maya (3 Slots Left)",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAbFwgZGQWV_rJdBgcJhCS3TgxoPca0gO2l1J7QBsBWQ-l3oGWqzoCz0tFEN_IeEAJnBFv8xwgtlWvE0zPPFjj5mCWjSFJShUa_9mhjQnTiI-Va4zFtnpl4ktfnrDJbroDrF79nY2aG9XFwFrLmGU3dA2XZx6pBv3RWc9yx6tSQWTr0KKVyhLs2eB6P-xoYT1pJEw3IWtvXlhzZPSCriotXb2r4zUKbej1uOti-iK-Qkjlp6e85_Q5P",
        imageAlt: "High-end boutique fitness gym and pilates studio",
      },
    ],
  },
  dashboard: {
    eyebrow: "Operations Cockpit",
    title: "See what's happening across your customer conversations.",
    description: "Real-time command center for Indonesian business operations.",
    badges: ["Automated QRIS Settlements", "Zero-Lag Operator Handover"],
    metrics: [
      {
        label: "Total Conversations",
        value: "1,284",
        hint: "↑ +18.4% vs last mo",
        hintTone: "navy" as const,
      },
      {
        label: "New Qualified Leads",
        value: "342",
        hint: "↑ +22.1% velocity",
        hintTone: "navy" as const,
      },
      {
        label: "Confirmed Bookings",
        value: "186",
        hint: "98.4% show-up rate",
        hintTone: "navy" as const,
      },
      {
        label: "Conversion Rate",
        value: "24.8%",
        hint: "Benchmark: 9.2%",
        hintTone: "navy" as const,
      },
    ],
    gmv: {
      label: "GMV Processed (This Month)",
      value: "Rp 142.800.000",
      growth: "+34.2% Growth",
      weeks: [
        { label: "W1", height: "h-14", active: false },
        { label: "W2", height: "h-20", active: false },
        { label: "W3", height: "h-24", active: false },
        { label: "W4", height: "h-28", active: true },
      ],
    },
    activity: [
      {
        name: "Bima Saputra",
        detail: "Fade Cut • Senopati",
        value: "Rp 120k Paid",
        tone: "success" as const,
      },
      {
        name: "Clarissa Angela",
        detail: "Facial • QRIS Confirmed",
        value: "Rp 350k DP",
        tone: "success" as const,
      },
      {
        name: "Arya Pratama",
        detail: "Web Lead • Consultation",
        value: "Routed to Host",
        tone: "info" as const,
      },
    ],
  },
  impact: {
    eyebrow: "What changes",
    title: "Less watching the phone. More seats filled.",
    stats: [
      {
        value: "24/7",
        title: "Always replies",
        description:
          "The chat is answered while you are with a guest, or already asleep.",
      },
      {
        value: "1",
        title: "One inbox",
        description:
          "Service, bookings, and the floor share the same conversation.",
      },
      {
        value: "<2m",
        title: "Slots lock now",
        description:
          "The table is held before they open someone else's chat.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Customer Stories",
    title: "Trusted by growing businesses.",
    items: [
      {
        quoteBefore: "We can now handle orders 24/7 thanks to DIUK. ",
        quoteHighlight: "No more missed requests",
        quoteAfter:
          "  and our CS is far more efficient.",
        initials: "FA",
        name: "Fadli Aliefinov",
        role: "Manager, Kasiko Coffee",
        tone: "teal" as const,
      },
      {
        quoteBefore: "DIUK helps us serve customers better. Fast, accurate replies keep people happy - ",
        quoteHighlight: "revenue grew 30% after adopting it",
        quoteAfter: ".",
        initials: "SA",
        name: "Sultan Aziz P",
        role: "Owner, Putri Melati Stationary",
        tone: "blue" as const,
      },
      {
        quoteBefore:
          "Guests book villa packages instantly with automated QRIS deposits. ",
        quoteHighlight: "It feels like having 5 extra receptionists",
        quoteAfter: " working 24/7.",
        initials: "NU",
        name: "Nadya Utami",
        role: "General Manager, Rimba Bali",
        tone: "emerald" as const,
      },
    ],
  },
  pricing: {
    id: "pricing",
    eyebrow: "Transparent Plans",
    title: "Start automating customer conversations today.",
    description: "Predictable flat plans. No hidden per-message markups.",
    plans: [
      {
        category: "AI AGENT",
        name: "Diuk Standard",
        description: "WhatsApp AI Agent Customer Service",
        price: "IDR 299.000",
        period: "/month",
        setupFee: "IDR 3.000.000,00",
        featured: false,
        cta: "Get Standard",
        waMessage:
          "Halo DIUK, saya tertarik dengan paket *Diuk Standard* (IDR 299.000/bulan). Mohon info lebih lanjut ya.",
        features: [
          "24 jam AI kerja",
          "AI responses 25k / month",
          "Basic CRM Integration",
          "Dashboard Customer Service",
          "Smart Broadcast",
        ],
      },
      {
        category: "AI AGENT",
        name: "Diuk Plus",
        description: "Multi-channel AI WhatsApp + Instagram",
        price: "IDR 499.000",
        period: "/month",
        setupFee: "IDR 4.000.000,00",
        featured: true,
        badge: "Most Popular",
        cta: "Get Plus",
        waMessage:
          "Halo DIUK, saya tertarik dengan paket *Diuk Plus* (IDR 499.000/bulan). Mohon info lebih lanjut ya.",
        features: [
          "24 jam AI kerja",
          "AI responses 50k / month",
          "Advanced CRM Integration",
          "Dashboard Customer Service",
          "Smart Broadcast",
        ],
      },
      {
        category: "AI AGENT",
        name: "Diuk Pro",
        description: "AI Agent + Reservation + Website Profile",
        price: "IDR 599.000",
        period: "/month",
        setupFee: "IDR 6.000.000,00",
        featured: false,
        cta: "Get Pro",
        waMessage:
          "Halo DIUK, saya tertarik dengan paket *Diuk Pro* (IDR 599.000/bulan). Mohon info lebih lanjut ya.",
        features: [
          "24 jam AI kerja",
          "AI responses 50k / month",
          "Advanced CRM Integration",
          "Dashboard Customer Service",
          "Smart Broadcast",
          "Smart Reservation System + Website Profile",
        ],
      },
    ],
  },
  cta: {
    eyebrow: "Automate Now",
    title: "Your next customer is already in the conversation.",
    description:
      "Let DIUK handle the conversation so your team can focus on in-store hospitality.",
    primaryCta: {
      label: "Start with DIUK",
      waMessage:
        "Halo DIUK, saya ingin mulai menggunakan DIUK Solution. Mohon dibantu proses selanjutnya ya.",
    },
    secondaryCta: {
      label: "Schedule 1-on-1 Consultation",
      waMessage:
        "Halo DIUK, saya ingin menjadwalkan konsultasi 1-on-1. Mohon info slot yang tersedia.",
    },
  },
  footer: {
    description:
      "AI that answers the chat, locks the table, and tells the floor. Built for clinics, shops, and dining rooms in Indonesia.",
    badge: "Made in Indonesia",
    columns: [
      {
        title: "Product",
        links: [
          { label: "How it works", href: "#how-it-works" },
          { label: "Customer service", href: "#product" },
          { label: "Reservations", href: "#product" },
          { label: "Pricing", href: "#pricing" },
        ],
      },
      {
        title: "Solutions",
        links: [
          { label: "Clinics", href: "#solutions" },
          { label: "Barbershops", href: "#solutions" },
          { label: "Dining", href: "#solutions" },
          { label: "Gyms & studios", href: "#solutions" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Login", href: "/login" },
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
        ],
      },
    ],
    copyright: "© 2026 DIUK Solution. All rights reserved.",
    tagline: "From the chat to a locked table.",
  },
} as const;
