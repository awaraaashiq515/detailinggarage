import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db as prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { text } = await req.json()

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        // Fetch AI settings for API key
        const aiSettings = await prisma.aISettings.findFirst()

        if (!aiSettings || !aiSettings.geminiApiKey) {
            return NextResponse.json({
                error: 'Gemini API key not configured. Please configure it in AI Settings.'
            }, { status: 400 })
        }

        if (!aiSettings.translationEnabled) {
            return NextResponse.json({
                error: 'Translation feature is currently disabled.'
            }, { status: 403 })
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(aiSettings.geminiApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        // Create translation prompt
        const prompt = `Translate the following text from Hindi to English. Only return the English translation, nothing else. Do not include any explanations or additional text:\n\n${text}`

        // Generate translation
        const result = await model.generateContent(prompt)
        const response = await result.response
        const translatedText = response.text()

        return NextResponse.json({
            success: true,
            translatedText: translatedText.trim()
        })

    } catch (error: any) {
        console.error('Translation error:', error)

        // Handle specific Gemini API errors
        if (error.message?.includes('API_KEY_INVALID')) {
            return NextResponse.json({
                error: 'Invalid Gemini API key. Please check your configuration.'
            }, { status: 400 })
        }

        if (error.message?.includes('RATE_LIMIT')) {
            return NextResponse.json({
                error: 'API rate limit exceeded. Please try again later.'
            }, { status: 429 })
        }

        return NextResponse.json({
            error: 'Translation failed. Please try again.'
        }, { status: 500 })
    }
}
