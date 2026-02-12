import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'
import type { CampaignWithVehicles } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET - List all campaigns with vehicles
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: campaigns, error } = await supabase
      .from('marketing_campaigns')
      .select(`
        *,
        vehicles:campaign_vehicles(*)
      `)
      .order('created_at', { ascending: false }) as { data: CampaignWithVehicles[] | null; error: unknown }

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Sort vehicles by display_order within each campaign
    const sorted = (campaigns || []).map(c => ({
      ...c,
      vehicles: (c.vehicles || []).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
    }))

    return NextResponse.json({ campaigns: sorted })
  } catch (error) {
    console.error('Error in campaigns GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new campaign with vehicles (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create campaigns' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, vehicles } = body as {
      name: string
      description?: string
      vehicles?: { vehicle_name: string; added_date?: string; notes?: string }[]
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create campaign
    const campaignData = {
      name,
      description: description || null,
      status: 'publicada' as const,
      created_by: admin.id,
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .insert(campaignData as never)
      .select()
      .single() as { data: { id: string } | null; error: unknown }

    if (campaignError || !campaign) {
      console.error('Error creating campaign:', campaignError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Insert vehicles if provided
    if (vehicles && vehicles.length > 0) {
      const vehicleRows = vehicles.map((v, i) => ({
        campaign_id: campaign.id,
        vehicle_name: v.vehicle_name,
        added_date: v.added_date || null,
        notes: v.notes || null,
        display_order: i,
      }))

      const { error: vehiclesError } = await supabase
        .from('campaign_vehicles')
        .insert(vehicleRows as never)

      if (vehiclesError) {
        console.error('Error inserting campaign vehicles:', vehiclesError)
      }
    }

    // Fetch full campaign with vehicles
    const { data: fullCampaign } = await supabase
      .from('marketing_campaigns')
      .select('*, vehicles:campaign_vehicles(*)')
      .eq('id', campaign.id)
      .single() as { data: CampaignWithVehicles | null; error: unknown }

    return NextResponse.json({ campaign: fullCampaign }, { status: 201 })
  } catch (error) {
    console.error('Error in campaigns POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

