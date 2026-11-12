import { db } from "@/lib/db"

export interface CaptionOptions {
    carModel?: string
    serviceType?: string
    tone?: "PREMIUM" | "HYPE" | "EDUCATIONAL" | "OFFER"
    customPrompt?: string
}

export async function generateAutoDetailingCaption(options: CaptionOptions): Promise<{
    caption: string
    hashtags: string[]
}> {
    const {
        carModel = "Luxury Beast",
        serviceType = "Ceramic Coating & PPF",
        tone = "PREMIUM",
        customPrompt
    } = options

    // Check if Gemini API key is configured in settings
    let geminiApiKey = ""
    try {
        const aiSettings = await db.aISettings.findFirst()
        if (aiSettings?.geminiApiKey) {
            geminiApiKey = aiSettings.geminiApiKey
        }
    } catch {
        // fallback
    }

    if (geminiApiKey) {
        try {
            const prompt = `Write an engaging high-converting social media caption for an automotive detailing studio called "Detailing Garage".
Vehicle: ${carModel}
Service Done: ${serviceType}
Tone: ${tone}
${customPrompt ? `Extra notes: ${customPrompt}` : ""}
Include emojis, bullet points of key benefits (Hydrophobic, UV Protection, Mirror Gloss, Scratch Resistance), call to action to visit Detailing Garage or DM/call for bookings, and trending hashtags. Return plain text.`

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            )

            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
                return {
                    caption: text.trim(),
                    hashtags: extractHashtags(text)
                }
            }
        } catch (err) {
            console.warn("Gemini generation failed, falling back to smart studio template:", err)
        }
    }

    // High quality automotive detailing templates tailored to Detailing Garage
    const defaultHashtags = [
        "#DetailingGarage",
        "#CarDetailing",
        "#PaintProtectionFilm",
        "#PPF",
        "#CeramicCoating",
        "#GrapheneCoating",
        "#MirrorShine",
        "#CarCareStudio",
        "#AutoDetailingWorld",
        "#CeramicPro",
        "#GlossBoss",
        "#CarEnthusiast"
    ]

    let caption = ""

    if (tone === "PREMIUM") {
        caption = `✨ Pure Perfection & Ultimate Protection for this stunning ${carModel}! 🚗💨

Another masterpiece rolls out of the Detailing Garage studio after receiving our flagship ${serviceType} treatment.

🛡️ Key Highlights:
✔️ Ultra Hydrophobic Self-Cleaning Effect
✔️ 10H Diamond Gloss & Deep Wet Mirror Reflection
✔️ Superior UV, Chemical & Stone-Chip Resistance
✔️ Backed by Official Studio Warranty

Give your prized machine the showroom glow and armor it truly deserves.

📍 Studio: Detailing Garage
📞 DM or Call us today to reserve your slot!

${defaultHashtags.join(" ")}`
    } else if (tone === "HYPE") {
        caption = `🔥 Next Level Gloss Alert! Check out this beast ${carModel} looking wet and mean after full ${serviceType}! 🚀✨

No ordinary wash. No standard polish. Only precision craftmanship by certified master detailers at Detailing Garage. 💯

Ready to turn heads at every traffic light?
Drop a "SHINE" in the comments or tap the link to book your detailing transformation! 🏎️💨

${defaultHashtags.join(" ")}`
    } else if (tone === "OFFER") {
        caption = `🎁 Special Studio Offer: Give your ${carModel} the ultimate defense!

Book your ${serviceType} package this week at Detailing Garage and get:
💥 Free 3-Stage Paint Decontamination
💥 Free Glass Water-Repellent Treatment
💥 Interior Anti-Bacterial Sanitization complimentary!

⏳ Limited slots available this month!
📲 Send us a DM or visit the studio today.

${defaultHashtags.join(" ")}`
    } else {
        // Educational
        caption = `💡 Why is ${serviceType} essential for your ${carModel}?

Indian roads and weather subject your car's clear coat to intense sun oxidation, acid rain, swirl marks, and road debris every single day.

At Detailing Garage, our ${serviceType}:
1️⃣ Locks in pristine factory paint condition
2️⃣ Provides an invisible sacrificial shield against scratches & stains
3️⃣ Keeps your car looking showroom fresh for years, preserving resale value.

Invest in protection today, avoid repainting tomorrow.
💬 Ask any detailing question in the comments below!

${defaultHashtags.join(" ")}`
    }

    return {
        caption,
        hashtags: defaultHashtags
    }
}

function extractHashtags(text: string): string[] {
    const matches = text.match(/#[a-zA-Z0-9_]+/g)
    return matches ? Array.from(new Set(matches)) : []
}
