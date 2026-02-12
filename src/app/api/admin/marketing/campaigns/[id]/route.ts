import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'
import type { CampaignWithVehicles } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET - Get single campaign with vehicles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .select('*, vehicles:campaign_vehicles(*)')
      .eq('id', id)
      .single() as { data: CampaignWithVehicles | null; error: unknown }

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Sort vehicles
    campaign.vehicles = (campaign.vehicles || []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    )

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error in campaign GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update campaign (status, name, description, vehicles)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update campaigns' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Build update object for campaign fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'status']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('marketing_campaigns')
        .update(updateData as never)
        .eq('id', id)

      if (updateError) {
        console.error('Error updating campaign:', updateError)
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
      }
    }

    // If vehicles array is provided, replace all vehicles
    if (body.vehicles !== undefined) {
      // Delete existing vehicles
      await supabase
        .from('campaign_vehicles')
        .delete()
        .eq('campaign_id', id)

      // Insert new vehicles
      if (body.vehicles && body.vehicles.length > 0) {
        const vehicleRows = body.vehicles.map((v: { vehicle_name: string; added_date?: string; notes?: string }, i: number) => ({
          campaign_id: id,
          vehicle_name: v.vehicle_name,
          added_date: v.added_date || null,
          notes: v.notes || null,
          display_order: i,
        }))

        const { error: vehiclesError } = await supabase
          .from('campaign_vehicles')
          .insert(vehicleRows as never)

        if (vehiclesError) {
          console.error('Error inserting vehicles:', vehiclesError)
        }
      }
    }

    // Return updated campaign
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('*, vehicles:campaign_vehicles(*)')
      .eq('id', id)
      .single() as { data: CampaignWithVehicles | null; error: unknown }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error in campaign PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

