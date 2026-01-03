import { NextResponse } from 'next/server'

/**
 * Test endpoint for Gemini API integration
 * This helps diagnose if the API key is configured correctly in production
 * 
 * GET /api/gemini-test
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  // Basic diagnostics
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : null,
  }

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'GEMINI_API_KEY environment variable is not set',
      diagnostics,
    }, { status: 500 })
  }

  // Test the API with a simple request
  try {
    const testPrompt = 'Respond with exactly: "API working correctly"'
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 50,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        status: 'error',
        message: 'Gemini API request failed',
        httpStatus: response.status,
        error: errorText,
        diagnostics,
      }, { status: 500 })
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({
      status: 'success',
      message: 'Gemini API is working correctly',
      response: generatedText,
      diagnostics,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to call Gemini API',
      error: error instanceof Error ? error.message : String(error),
      diagnostics,
    }, { status: 500 })
  }
}

