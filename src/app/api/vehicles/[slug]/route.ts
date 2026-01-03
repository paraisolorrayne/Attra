import { NextRequest, NextResponse } from 'next/server'
import { getVehicleBySlug } from '@/lib/autoconf-api'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // getVehicleBySlug extracts the ID from slug and uses /veiculo endpoint
    const vehicle = await getVehicleBySlug(slug)

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: 'Veículo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    console.error('Vehicle API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

