export interface NearMeCategory {
    id: string
    label: string
    emoji: string
    description: string
}

export const NEAR_ME_CATEGORIES: NearMeCategory[] = [
    { id: "garages", label: "Garages near me", emoji: "🔧", description: "Multi-brand car service & repair workshops" },
    { id: "best-garages", label: "Best garages near me", emoji: "🏆", description: "Top-rated & verified premium garages" },
    { id: "mechanics", label: "Mechanics near me", emoji: "🧑‍🔧", description: "Expert auto mechanics & electrical specialists" },
    { id: "rsa", label: "RSA near me", emoji: "🚨", description: "24x7 Roadside Assistance & breakdown rescue" },
    { id: "towing", label: "Towing near me", emoji: "🛻", description: "Hydraulic flatbed & crane vehicle towing" },
    { id: "car-wash", label: "Car wash near me", emoji: "🫧", description: "High-pressure foam wash & interior vacuuming" },
    { id: "detailing", label: "Detailing centre near me", emoji: "💎", description: "Ceramic coating, graphene, PPF & paint correction" },
    { id: "used-cars", label: "Used car dealers near me", emoji: "🚗", description: "Certified pre-owned cars with inspection" },
    { id: "spare-parts", label: "Spare parts shop near me", emoji: "⚙️", description: "OEM & aftermarket spare parts retailers" },
    { id: "spare-parts-wholesale", label: "Spare parts wholesale near me", emoji: "📦", description: "Bulk automobile parts distributors" },
    { id: "oem-dealers", label: "OEM dealers near me", emoji: "🏢", description: "Authorized brand service centres & showrooms" },
    { id: "accessories", label: "Accessories near me", emoji: "🚙", description: "Mats, seat covers, dash cams & styling" },
    { id: "battery", label: "Battery service near me", emoji: "🔋", description: "Car battery testing, jumpstart & replacement" },
    { id: "tyre", label: "Tyre shop near me", emoji: "🔘", description: "Wheel alignment, balancing & new tyres" },
    { id: "ev-service", label: "EV service near me", emoji: "⚡", description: "Electric vehicle charging, battery & diagnostics" },
    { id: "denting-painting", label: "Denting & painting near me", emoji: "🎨", description: "Booth painting, scratch & accident repair" },
]

export const POPULAR_CITIES = [
    "All cities",
    "Mandi",
    "Sundernagar",
    "Kullu",
    "Manali",
    "Bilaspur",
    "Shimla",
    "Hamirpur",
    "Kangra",
    "Dharamshala",
    "Chandigarh Tricity",
    "Solan",
    "Una",
    "Dehradun"
]

