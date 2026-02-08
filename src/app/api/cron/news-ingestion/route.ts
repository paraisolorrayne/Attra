import { NextRequest, NextResponse } from 'next/server'
import { runWeeklyNewsIngestion } from '@/lib/jobs/weekly-news-ingestion'

// This endpoint can be called by:
// 1. Vercel Cron (add to vercel.json)
// 2. Manual execution (GET /api/cron/news-ingestion?secret=xxx)
// 3. External scheduler (GitHub Actions, etc)

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Check for Vercel Cron authorization or secret parameter
  const isVercelCron = authHeader === `Bearer ${CRON_SECRET}`
  const hasValidSecret = secret === CRON_SECRET && CRON_SECRET !== ''

  if (!isVercelCron && !hasValidSecret) {
    // Allow in development without secret
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  console.log('[NewsIngestion API] Starting news ingestion job...')

  try {
    const result = await runWeeklyNewsIngestion()

    if (result.success) {
      return NextResponse.json({
        message: 'News ingestion completed successfully',
        cycleId: result.cycleId,
        articlesInserted: result.articlesInserted,
        errors: result.errors,
      })
    } else {
      return NextResponse.json({
        message: 'News ingestion failed',
        articlesInserted: result.articlesInserted,
        errors: result.errors,
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[NewsIngestion API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Also support POST for more secure execution
export async function POST(request: NextRequest) {
  return GET(request)
}

