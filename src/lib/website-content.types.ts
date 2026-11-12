export interface WebsiteContent {
  topbar: {
    announcement: string;
    phone1: string;
    phone2: string;
    phone3: string;
    email: string;
    instagramUrl: string;
    facebookUrl: string;
    whatsappNumber: string;
  };
  header: {
    brandName: string;
    brandNameAccent: string;
    logoUrl: string;
    ctaText: string;
    ctaLink: string;
    navLinks: {
      label: string;
      href: string;
      isExternal?: boolean;
    }[];
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    bgImageUrl: string;
    stats: { value: string; label: string }[];
  };
  ticker: {
    items: string[];
  };
  pdi: {
    eyebrow: string;
    heading: string;
    description: string;
    fuelTypes: {
      title: string;
      subtitle: string;
      items: string[];
    }[];
    tools: {
      name: string;
      description: string;
    }[];
    pricing: {
      eyebrow: string;
      amount: string;
      travelNote: string;
      features: string[];
      ctaText: string;
      ctaLink: string;
      footnote: string;
    };
    checkAreas: {
      index: string;
      title: string;
      items: string[];
    }[];
    ritchie: {
      eyebrow: string;
      name: string;
      quote: string;
      description: string;
      imageUrl: string;
    };
    sampleReports: {
      title: string;
      subtitle: string;
      imageUrl: string;
    }[];
  };
  services: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryList: {
      id: string;
      title: string;
      description: string;
      items: string[];
      isActive: boolean;
    }[];
    solutionsHeading: string;
    solutionsList: {
      id: string;
      title: string;
      description: string;
      fine?: string;
      items?: string[];
      isActive: boolean;
    }[];
    poster: {
      imageUrl: string;
      eyebrow: string;
      heading: string;
      description: string;
    };
  };
  packages: {
    eyebrow: string;
    heading: string;
    description: string;
    list: {
      id: string;
      forText: string;
      name: string;
      items: string[];
      isHighlighted: boolean;
      ctaText: string;
      ctaLink: string;
    }[];
  };
  customers: {
    eyebrow: string;
    heading: string;
    description: string;
    useFacebookPosts?: boolean;
    facebookPageUrl?: string;
    list: {
      id: string;
      brand: string;
      carModel: string;
      customerDetails: string;
      imageUrl: string;
    }[];
    brands: string[];
  };
  videos: {
    eyebrow: string;
    heading: string;
    description: string;
    reels: {
      id: string;
      videoUrl: string;
      posterUrl: string;
      tag: string;
      title: string;
    }[];
    sideCard: {
      videoUrl: string;
      posterUrl: string;
      heading: string;
      description: string;
      ctaText: string;
      ctaLink: string;
    };
  };
  studio: {
    eyebrow: string;
    heading: string;
    leadText: string;
    description: string;
    taglineHindi: string;
    values: {
      title: string;
      description: string;
    }[];
    photos: {
      main: string;
      sub1: string;
      sub2: string;
    };
    region: {
      eyebrow: string;
      heading: string;
      description: string;
      districts: { name: string; isHighlighted: boolean }[];
    };
  };
  creators: {
    eyebrow: string;
    heading: string;
    description: string;
    roles: {
      roleNum: string;
      title: string;
      description: string;
      bestFit: string;
    }[];
    requirements: { label: string; value: string }[];
    applicationText: string;
    applicationBullets: string[];
    whatsappNumber: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: {
      id: string;
      question: string;
      answer: string;
      isOpen?: boolean;
    }[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    description: string;
    phones: string[];
    whatsappNumber: string;
    email: string;
    address: string;
    hours: string;
    bookingServices: string[];
  };
  about?: {
    title: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  gallery?: {
    id: string;
    url: string;
    category: string;
    title: string;
    isActive: boolean;
  }[];
  testimonials?: {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatarUrl?: string;
    isActive: boolean;
  }[];
  social?: {
    instagramUrl?: string;
    facebookUrl?: string;
    widgetType?: string;
    widgetId?: string;
  };
  footer: {
    aboutText: string;
    tagline: string;
    copyrightText: string;
  };
}

export const defaultWebsiteContent: WebsiteContent = {
  topbar: {
    announcement: "Mandi, Himachal Pradesh · Serving all of HP & Leh-Ladakh",
    phone1: "+91 86794 00014",
    phone2: "+91 86798 00074",
    phone3: "+91 98160 36880",
    email: "info@detailinggarage.in",
    instagramUrl: "https://www.instagram.com/detailinggarage",
    facebookUrl: "https://www.facebook.com/detailinggarage",
    whatsappNumber: "918679400014"
  },
  header: {
    brandName: "Detailing",
    brandNameAccent: "Garage",
    logoUrl: "/images/logo.png",
    ctaText: "Book your PDI",
    ctaLink: "#contact",
    navLinks: [
      { label: "PDI", href: "/pdi" },
      { label: "Services", href: "#services" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Cars", href: "/cars" },
      { label: "Bikes", href: "/bikes" },
      { label: "Insurance Claim", href: "/insurance-claim" },
      { label: "Shop", href: "/shop" },
      { label: "Feed", href: "/feed" },
      { label: "Packages", href: "#packages" },
      { label: "Studio", href: "#studio" },
      { label: "Contact", href: "#contact" }
    ]
  },
  hero: {
    eyebrow: "Complete Car Care Under One Roof",
    titleLine1: "Inspect.",
    titleLine2: "Protect.",
    titleLine3: "Restore.",
    description: "Mandi's car care studio for 100+ point Pre-Delivery Inspection, ceramic and graphene coating, PPF, detailing and denting & painting. We come to your dealership anywhere in Himachal Pradesh, so you can inspect before you accept.",
    primaryCtaText: "Book your PDI",
    primaryCtaLink: "#contact",
    secondaryCtaText: "All services",
    secondaryCtaLink: "#services",
    bgImageUrl: "/images/studio/storefront-night.jpg",
    stats: [
      { value: "100+", label: "PDI checkpoints" },
      { value: "1000+", label: "Customers served" },
      { value: "Petrol · Diesel · EV", label: "Every fuel type" }
    ]
  },
  ticker: {
    items: [
      "Inspect Before You Accept",
      "Pre-Delivery Inspection",
      "Ceramic & Graphene Coating",
      "Paint Protection Film",
      "Denting & Painting",
      "Aapki Car… Hamari Responsibility"
    ]
  },
  pdi: {
    eyebrow: "Pre-Delivery Inspection",
    heading: "Inspect before you accept",
    description: "Buying a new car? Book a PDI before you sign the delivery papers. We check your car at the dealership with professional tools, while the dealer can still fix anything we find. No hidden surprises on delivery day.",
    fuelTypes: [
      {
        title: "Petrol",
        subtitle: "Turbo & NA",
        items: ["Engine & gearbox", "Fluids & leaks", "ECU fault scan"]
      },
      {
        title: "Diesel",
        subtitle: "Turbo & non-turbo",
        items: ["Engine noise", "Underbody on lift", "Exhaust & DPF"]
      },
      {
        title: "EV",
        subtitle: "Electric",
        items: ["Battery health", "Charging port", "HV system checks"]
      }
    ],
    tools: [
      { name: "Scanner", description: "Pro diagnostics, all ECUs" },
      { name: "Paint gauge", description: "Every panel measured" },
      { name: "Tyre gauge", description: "All 5 tyres" },
      { name: "Report", description: "Written handover with photos" }
    ],
    pricing: {
      eyebrow: "PDI charges",
      amount: "₹3,000",
      travelNote: "+ travel",
      features: [
        "100+ point vehicle inspection",
        "Professional diagnostic scanner",
        "Paint thickness gauge on every panel",
        "Tyre inspection with gauge",
        "Complete underbody inspection",
        "Battery, electrical & sensor checks",
        "Final PDI report with photo evidence"
      ],
      ctaText: "Get a quote",
      ctaLink: "#contact",
      footnote: "Travel is charged from Mandi to your dealership. Example: a PDI in Hamirpur was quoted at ₹3,000 + ₹2,000 travel."
    },
    checkAreas: [
      {
        index: "01",
        title: "Scanner diagnostics",
        items: ["ECU / OBD scan of all modules", "Engine control module", "ABS, airbag & transmission", "Fault code detection", "Transport mode check"]
      },
      {
        index: "02",
        title: "Exterior",
        items: ["Paint thickness on every panel", "Panel gaps & alignment", "Repaint, scratches & dents", "Rust, glass & windshield", "Body panel fitment"]
      },
      {
        index: "03",
        title: "Tyres & wheels",
        items: ["Tyre manufacturing date", "Pressure & tread depth", "Alloy / wheel condition", "Spare wheel", "Jack & tool kit"]
      },
      {
        index: "04",
        title: "Underbody",
        items: ["Complete underbody scan", "Chassis & suspension", "Fuel and brake lines", "Leakage inspection", "Exhaust system"]
      },
      {
        index: "05",
        title: "Mechanical",
        items: ["Engine bay inspection", "Fluid levels", "Cooling system", "Battery health", "Belts, hoses & brakes"]
      },
      {
        index: "06",
        title: "Interior",
        items: ["Dashboard & cluster", "Seats & upholstery", "Roof liner", "Door trims & switches", "Seat belts & boot"]
      },
      {
        index: "07",
        title: "Functional checks",
        items: ["Lights, indicators, fog lamps", "Horn, wipers & washers", "Power windows & mirrors", "AC & infotainment", "Reverse camera & sensors"]
      },
      {
        index: "08",
        title: "Documents",
        items: ["VIN verification", "Engine number", "Chassis number", "Keys & remote", "Service book & manuals"]
      }
    ],
    ritchie: {
      eyebrow: "Your PDI professional",
      name: "Ritchie",
      quote: "“Every new car deserves a professional inspection.”",
      description: "Ritchie leads every Pre-Delivery Inspection at Detailing Garage. He has inspected new cars at Nexa, Tata, Mahindra, Honda and Volkswagen dealerships across Himachal, and hands you a written report you can show the dealer the same day.",
      imageUrl: "/images/studio/ritchie.jpg"
    },
    sampleReports: [
      {
        title: "PDI report",
        subtitle: "Mahindra Scorpio-N · result and checks",
        imageUrl: "/images/reports/pdi-report-scorpio-n.jpg"
      },
      {
        title: "Photo evidence",
        subtitle: "Tata Sierra EV · observations & advice",
        imageUrl: "/images/reports/photo-evidence-sierra-ev.jpg"
      },
      {
        title: "PDI quotation",
        subtitle: "Swift Dzire · Hamirpur",
        imageUrl: "/images/reports/pdi-quotation.jpg"
      },
      {
        title: "Checklist",
        subtitle: "What every PDI includes",
        imageUrl: "/images/pdi-poster-square.jpg"
      }
    ]
  },
  services: {
    eyebrow: "Detailing & protection",
    heading: "Showroom se bhi better finish",
    description: "Gaadi purani ho ya nayi, shine hamesha nayi jaisi honi chahiye. Every job starts with an inspection under studio lights so you know what we found before we begin.",
    primaryList: [
      {
        id: "1",
        title: "Ceramic coating",
        description: "A hard, glossy layer bonded to the clear coat. Water beads straight off and the car stays cleaner for longer.",
        items: ["9H multi-layer systems", "UV & weather protection", "Easy maintenance"],
        isActive: true
      },
      {
        id: "2",
        title: "Graphene coating",
        description: "The next step up from ceramic. Better heat dissipation, lower water spotting and a deep, long-lasting shine.",
        items: ["Anti-water-spot formula", "Long lasting gloss", "Ideal for dark colours"],
        isActive: true
      },
      {
        id: "3",
        title: "Paint protection film",
        description: "Clear, self-healing film that takes the stone chips from hill roads so your paint never has to.",
        items: ["Self-healing technology", "Scratch resistant", "Colour & finish wrapping"],
        isActive: true
      },
      {
        id: "4",
        title: "Paint correction",
        description: "Machine polishing that removes swirl marks, haze and light scratches for a clear, mirror-flat reflection.",
        items: ["Single or multi-stage polish", "Swirl & hologram removal", "Prep for coating or PPF"],
        isActive: true
      },
      {
        id: "5",
        title: "Interior detailing",
        description: "Seats, carpets, roof lining, vents and seams deep-cleaned. Leather cleaned and conditioned, odours removed.",
        items: ["Steam & extraction clean", "Leather conditioning", "Sanitisation & odour removal"],
        isActive: true
      },
      {
        id: "6",
        title: "Engine bay cleaning",
        description: "Safe degreasing and dressing of the engine bay, with electricals protected. Easier to spot leaks later.",
        items: ["Low-pressure wash", "Plastic & rubber dressing", "Leak-friendly finish"],
        isActive: true
      },
      {
        id: "7",
        title: "Glass & alloy protection",
        description: "Hydrophobic glass coating for clear vision in rain and snow, and alloy coating that keeps brake dust off.",
        items: ["Rain-repellent glass", "Alloy & caliper coating", "Headlight restoration"],
        isActive: true
      },
      {
        id: "8",
        title: "Exterior detailing",
        description: "Foam pre-wash, hand wash, iron and tar removal, clay bar and a sealant finish. Wheels and arches included.",
        items: ["Decontamination wash", "Clay bar treatment", "Sealant finish"],
        isActive: true
      },
      {
        id: "9",
        title: "Denting & painting",
        description: "Expert dent repair and colour-matched paint in a paint booth, finished to a showroom standard.",
        items: ["Dent repair", "Paint booth finish", "Accident repair"],
        isActive: true
      },
      {
        id: "10",
        title: "Underbody coating",
        description: "A protective layer under the car against rust from wet, salted and snowy hill roads, plus less road noise in the cabin.",
        items: ["Anti-rust protection", "Stone chip resistance", "Quieter cabin"],
        isActive: true
      },
      {
        id: "11",
        title: "Leather & trim coating",
        description: "Coatings for leather seats, plastic trims and rims that resist stains, fading and brake dust, and keep the cabin looking new.",
        items: ["Leather coating", "Trim & rim coating", "Engine bay coating"],
        isActive: true
      },
      {
        id: "12",
        title: "Doorstep detailing",
        description: "No time to visit the studio? Our team brings the equipment to your home or office for washes and detailing.",
        items: ["At home or office", "Interior & exterior", "Book on WhatsApp"],
        isActive: true
      }
    ],
    solutionsHeading: "One garage, every automotive solution",
    solutionsList: [
      {
        id: "s1",
        title: "Insurance claim assistance",
        description: "Accident ke baad paperwork ki tension? We help with damage inspection, documentation and coordination with your insurer during repair.",
        fine: "Claim approval is always the insurer's decision. Detailing Garage is not an insurer.",
        isActive: true
      },
      {
        id: "s2",
        title: "24×7 roadside assistance",
        description: "Battery discharge, puncture, towing or emergency help. Call us any time and we will do our best to reach you.",
        isActive: true
      },
      {
        id: "s3",
        title: "Leh-Ladakh rescue support",
        description: "Remote area support for road trips through Lahaul-Spiti and Ladakh, coordinated with our rescue response team.",
        isActive: true
      },
      {
        id: "s4",
        title: "Parts & accessories",
        description: "Genuine spare parts plus an in-studio accessories store, sourced and delivered quickly.",
        items: ["LED lights & sound systems", "Thar, Jimny & Hilux modifications", "LS2, Axor & SMK helmets"],
        isActive: true
      },
      {
        id: "s5",
        title: "On-site vehicle support",
        description: "Our technician comes to your location for inspections and minor fixes, so you don't lose a day at the workshop.",
        isActive: true
      },
      {
        id: "s6",
        title: "Dealer delivery support",
        description: "We stand with you at the dealership on delivery day, explain what we found and help you get it fixed before accepting the car.",
        isActive: true
      }
    ],
    poster: {
      imageUrl: "/images/services-poster.jpg",
      eyebrow: "Mountains to remote roads",
      heading: "Hamara mission sirf gaadi repair karna nahi",
      description: "Balki har customer ka trust jeetna hai. From PDI on delivery day to coating, repairs, insurance paperwork and help on the road, one team looks after your car for its whole life."
    }
  },
  packages: {
    eyebrow: "Detailing packages",
    heading: "Pick the level of care",
    description: "Prices depend on the size and condition of your car. Message us your model for an exact quote.",
    list: [
      {
        id: "p1",
        forText: "Monthly upkeep",
        name: "Express shine",
        items: ["Foam & hand wash", "Interior vacuum", "Tyre & trim dressing", "Glass cleaning"],
        isHighlighted: false,
        ctaText: "Ask for price",
        ctaLink: "#contact"
      },
      {
        id: "p2",
        forText: "Deep clean",
        name: "Signature detail",
        items: ["Everything in Express", "Clay bar & decontamination", "Interior steam clean", "Engine bay cleaning", "Sealant finish"],
        isHighlighted: false,
        ctaText: "Ask for price",
        ctaLink: "#contact"
      },
      {
        id: "p3",
        forText: "Most popular for new cars",
        name: "Ceramic shield",
        items: ["Paint correction", "Ceramic or graphene coating", "Glass & alloy coating", "Interior protection"],
        isHighlighted: true,
        ctaText: "Ask for price",
        ctaLink: "#contact"
      },
      {
        id: "p4",
        forText: "Maximum protection",
        name: "Total protection",
        items: ["Full body PPF", "Ceramic top coat", "Glass & alloy coating", "Leather & fabric coating"],
        isHighlighted: false,
        ctaText: "Ask for price",
        ctaLink: "#contact"
      }
    ]
  },
  customers: {
    eyebrow: "Another happy customer",
    heading: "Delivered with peace of mind",
    description: "Live customer deliveries verified with professional PDI and synced directly from our Facebook page. Tap any card to view the full verification details.",
    useFacebookPosts: true,
    facebookPageUrl: "https://www.facebook.com/detailinggarage.in",
    list: [
      {
        id: "c1",
        brand: "Maruti Suzuki",
        carModel: "Grand Vitara 2026",
        customerDetails: "Mr. Gyanchand Sharma · Nexa Palampur",
        imageUrl: "/images/customers/grand-vitara-gyanchand-sharma.jpg"
      },
      {
        id: "c2",
        brand: "Tata",
        carModel: "Safari 1.5 Petrol",
        customerDetails: "Rohit Sharma · NG Motors, Hamirpur",
        imageUrl: "/images/customers/safari-rohit-sharma.jpg"
      },
      {
        id: "c3",
        brand: "Tata · EV",
        carModel: "Sierra EV ADV 75",
        customerDetails: "Mr. Mayank Saini · Surya Tata, Mandi",
        imageUrl: "/images/customers/sierra-ev-mayank-saini.jpg"
      },
      {
        id: "c4",
        brand: "Honda",
        carModel: "Amaze 2026",
        customerDetails: "Mr. Kapil Mahajan · Himalayan Honda, Mandi",
        imageUrl: "/images/customers/amaze-kapil-mahajan.jpg"
      },
      {
        id: "c5",
        brand: "Mahindra",
        carModel: "XUV 7XO Petrol",
        customerDetails: "Mr. Pankaj Sharma, Shimla · JS Grover, Jawalaji",
        imageUrl: "/images/customers/xuv7xo-pankaj-sharma.jpg"
      },
      {
        id: "c6",
        brand: "Tata",
        carModel: "Nexon Black Edition",
        customerDetails: "Virender Thakur · Tata Surya, Mandi",
        imageUrl: "/images/customers/nexon-virender-thakur.jpg"
      },
      {
        id: "c7",
        brand: "Volkswagen",
        carModel: "Virtus GT Line",
        customerDetails: "Kunal Nikhra, Chamba · Sant Volkswagen",
        imageUrl: "/images/customers/virtus-kunal-nikhra.jpg"
      },
      {
        id: "c8",
        brand: "Skoda",
        carModel: "Slavia 1.5 facelift",
        customerDetails: "Mr. Nikeet Sharma · Dev Bhoomi Skoda, Mandi",
        imageUrl: "/images/customers/slavia-nikeet-sharma.jpg"
      },
      {
        id: "c9",
        brand: "Mahindra",
        carModel: "Scorpio-N Z2 MT",
        customerDetails: "JS Grover Mahindra, Nagrota",
        imageUrl: "/images/customers/scorpio-n-nagrota.jpg"
      }
    ],
    brands: ["Maruti Suzuki", "Tata", "Mahindra", "Hyundai", "Kia", "Toyota", "Honda", "Skoda", "Volkswagen", "MG", "Force"]
  },
  videos: {
    eyebrow: "Watch us work",
    heading: "Straight from the studio floor",
    description: "Real work from our Mandi studio. Tap a clip to pause it.",
    reels: [
      {
        id: "v1",
        videoUrl: "/videos/hector-detailing.mp4",
        posterUrl: "/videos/hector-detailing.jpg",
        tag: "Interior & exterior detailing",
        title: "MG Hector"
      },
      {
        id: "v2",
        videoUrl: "/videos/opening-night.mp4",
        posterUrl: "/videos/opening-night.jpg",
        tag: "Mandi studio",
        title: "Lights on"
      }
    ],
    sideCard: {
      videoUrl: "/videos/storefront-day.mp4",
      posterUrl: "/videos/storefront-day.jpg",
      heading: "Drive in, relax, drive out shining",
      description: "Machine polishing, interior steam cleaning and coatings happen in our own bays while you wait in the lounge. Prefer us to come to you? Ask about detailing at your doorstep.",
      ctaText: "Book a slot",
      ctaLink: "#contact"
    }
  },
  studio: {
    eyebrow: "Our studio in Mandi",
    heading: "Car sirf ek vehicle nahi hoti",
    leadText: "Ye aapki mehnat, aapke sapne aur aapki family ki safety se judi hoti hai. That is why every car gets professional care at Detailing Garage.",
    description: "Our studio in Mandi has dedicated bays for detailing, coating and PPF, a customer lounge where you can wait in comfort, and a store for genuine accessories. Our PDI team travels to dealerships across the state.",
    taglineHindi: "Aapki Car… Hamari Responsibility.",
    values: [
      { title: "Transparent", description: "Photo reports before and after" },
      { title: "Expert", description: "Trained technicians and a dedicated PDI professional" },
      { title: "Equipped", description: "Scanners, paint and tyre gauges" }
    ],
    photos: {
      main: "/images/studio/storefront-day.jpg",
      sub1: "/images/studio/lounge-window.jpg",
      sub2: "/images/studio/lounge.jpg"
    },
    region: {
      eyebrow: "Service area",
      heading: "All of Himachal, plus Leh-Ladakh",
      description: "Based in Mandi. Our PDI team travels to dealerships in every district.",
      districts: [
        { name: "Mandi", isHighlighted: true },
        { name: "Kangra", isHighlighted: false },
        { name: "Kullu", isHighlighted: false },
        { name: "Hamirpur", isHighlighted: false },
        { name: "Una", isHighlighted: false },
        { name: "Shimla", isHighlighted: false },
        { name: "Chamba", isHighlighted: false },
        { name: "Bilaspur", isHighlighted: false },
        { name: "Solan", isHighlighted: false },
        { name: "Sirmaur", isHighlighted: false },
        { name: "Kinnaur", isHighlighted: false },
        { name: "Lahaul-Spiti", isHighlighted: false },
        { name: "Leh-Ladakh", isHighlighted: true }
      ]
    }
  },
  creators: {
    eyebrow: "Work with us · Creators",
    heading: "We are hiring 4 auto creators",
    description: "We are looking for auto and lifestyle creators to shoot Instagram Reels and YouTube Shorts of our real work. Each creator owns one type of video and shoots 4 reels a month at our studio in Mandi or at customer deliveries.",
    roles: [
      {
        roleNum: "Role 1 · PDI",
        title: "PDI creator",
        description: "Scanner readings, paint thickness checks, tyre and underbody inspections and the “PDI Verified” sticker moment.",
        bestFit: "Best fit: auto reviewers and new-car buyer content."
      },
      {
        roleNum: "Role 2 · Detailing",
        title: "Transformation creator",
        description: "Before and after washes, paint correction, interior detailing, engine bay cleaning, glass and alloy protection.",
        bestFit: "Best fit: satisfying / ASMR and car-care creators."
      },
      {
        roleNum: "Role 3 · Coating",
        title: "Protection creator",
        description: "Ceramic and graphene coating, water-beading tests, PPF installs and long-term durability updates.",
        bestFit: "Best fit: premium car and lifestyle creators."
      },
      {
        roleNum: "Role 4 · Stories",
        title: "Trust & services creator",
        description: "Accident-to-delivery repair stories, claim paperwork help and roadside rescue stories from Himachal.",
        bestFit: "Best fit: local Himachal, travel and storytelling creators."
      }
    ],
    requirements: [
      { label: "Age", value: "18 years or above" },
      { label: "Niche", value: "Cars, auto detailing, road trips, lifestyle, Himachal local content" },
      { label: "Location", value: "Based in or able to travel to Mandi, Kangra, Kullu or Shimla" },
      { label: "Followers", value: "5,000+ on Instagram (nano and micro creators welcome)" },
      { label: "Language", value: "Hindi / Hinglish voice-over, Pahari a plus" },
      { label: "Equipment", value: "Smartphone with 4K video; gimbal and lav mic preferred" }
    ],
    applicationText: "Send your application on WhatsApp to +91 86794 00014 or email info@detailinggarage.in with:",
    applicationBullets: [
      "Instagram / YouTube handles and follower count",
      "2–3 links to your best automotive or local reels",
      "Your rate card (per reel, per story, barter preference)",
      "City and availability for shoots in Mandi"
    ],
    whatsappNumber: "918679400014"
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions before you book",
    items: [
      {
        id: "faq1",
        question: "What is a Pre-Delivery Inspection (PDI)?",
        answer: "A PDI is a detailed check of your new car before you take delivery. We scan the electronics, measure paint thickness on every panel, check tyres, the underbody, fluids and documents, and give you a written report. If we find a problem, the dealer can fix it before you sign."
      },
      {
        id: "faq2",
        question: "When should I book my PDI?",
        answer: "As soon as your dealer gives you a delivery date. The inspection is done at the dealership before you sign the delivery papers, so book a day or two ahead and tell us the dealership name."
      },
      {
        id: "faq3",
        question: "Do you inspect electric vehicles?",
        answer: "Yes. For EVs we check battery health, the charging port and high-voltage system along with the full 100+ point checklist. We have inspected cars like the Tata Sierra EV."
      },
      {
        id: "faq4",
        question: "How much does a PDI cost?",
        answer: "PDI charges are ₹3,000 plus travel from Mandi to your dealership. Send us your car model and dealership on WhatsApp and we will share an exact quotation."
      },
      {
        id: "faq5",
        question: "Does the PDI replace my manufacturer warranty?",
        answer: "No. Our report records the car's condition on the day of inspection. Warranty claims stay with the manufacturer and the dealership. The report helps you raise issues before delivery."
      },
      {
        id: "faq6",
        question: "Ceramic coating or PPF, which is right for me?",
        answer: "Ceramic coating adds gloss and makes washing easy. PPF is a physical film that absorbs stone chips and scratches, which matters on hill roads. Many owners choose PPF on the front and ceramic over the whole car. We will advise after seeing your car."
      },
      {
        id: "faq7",
        question: "Can you help with my insurance claim?",
        answer: "Yes, we help with damage inspection, documentation and coordinating the repair with your insurer. The claim decision is always made by the insurance company."
      }
    ]
  },
  contact: {
    eyebrow: "Contact & booking",
    heading: "Book your PDI",
    description: "Tell us your car, dealership and the service you want. We will confirm on WhatsApp.",
    phones: ["+91 86794 00014", "+91 86798 00074", "+91 98160 36880"],
    whatsappNumber: "918679400014",
    email: "info@detailinggarage.in",
    address: "Opposite Rani Ki Bain, Gutkar, Mandi, Himachal Pradesh – 175021",
    hours: "Mon-Sun, 9:00 AM - 7:00 PM",
    bookingServices: [
      "Pre-Delivery Inspection",
      "Ceramic / Graphene Coating",
      "Paint Protection Film",
      "Detailing",
      "Denting & Painting",
      "Insurance Claim Help",
      "Roadside Assistance"
    ]
  },
  about: {
    title: "About Detailing Garage",
    description: "We provide the most comprehensive Pre-Delivery Inspection and premium detailing services for your luxury and everyday vehicles. Ensure your peace of mind before taking delivery with our 50+ point inspection process.",
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Inspections", value: "1,000+" },
      { label: "Happy Clients", value: "99%" },
      { label: "Expert Engineers", value: "15+" }
    ]
  },
  gallery: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      category: "Detailing",
      title: "Exterior Polish",
      isActive: true
    }
  ],
  testimonials: [
    {
      id: "1",
      name: "Rahul Sharma",
      role: "BMW Owner",
      content: "The PDI service saved me from buying a car with a repainted door. Highly professional and thorough!",
      rating: 5,
      avatarUrl: "https://i.pravatar.cc/150?u=rahul",
      isActive: true
    }
  ],
  social: {
    instagramUrl: "https://www.instagram.com/detailinggarage.in",
    facebookUrl: "https://www.facebook.com/detailinggarage.in",
    widgetType: "elfsight",
    widgetId: "YOUR_ELFSIGHT_WIDGET_ID"
  },
  footer: {
    aboutText: "We inspect what others miss. We protect what you value. Complete car care under one roof in Mandi, Himachal Pradesh.",
    tagline: "Detailing That Defines Luxury.",
    copyrightText: "Detailing Garage™, Mandi, Himachal Pradesh."
  }
};

