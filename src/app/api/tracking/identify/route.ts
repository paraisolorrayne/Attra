import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// N8N webhook URL and secret for enrichment
const N8N_ENRICHMENT_WEBHOOK = process.env.N8N_ENRICHMENT_WEBHOOK_URL
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fingerprint_db_id,
      source,
      email,
      phone,
      name,
    } = body

    if (!fingerprint_db_id) {
      return NextResponse.json({ error: 'Missing fingerprint_db_id' }, { status: 400 })
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })
    }

    // Check if profile already exists with this email or phone
    let existingProfile = null
    
    if (email) {
      const { data } = await supabase
        .from('visitor_profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()
      existingProfile = data
    }
    
    if (!existingProfile && phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      const { data } = await supabase
        .from('visitor_profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .single()
      existingProfile = data
    }

    let profileId: string

    if (existingProfile) {
      // Update existing profile
      profileId = existingProfile.id
      
      const updates: Record<string, unknown> = {
        status: 'identified',
        updated_at: new Date().toISOString(),
      }
      
      if (email && !existingProfile.email) {
        updates.email = email.toLowerCase()
      }
      if (phone && !existingProfile.phone) {
        updates.phone = phone.replace(/\D/g, '')
      }
      if (name) {
        updates.full_name = name
        const nameParts = name.split(' ')
        updates.first_name = nameParts[0]
        updates.last_name = nameParts.slice(1).join(' ') || null
      }

      await supabase
        .from('visitor_profiles')
        .update(updates)
        .eq('id', profileId)

      // Log merge event
      await supabase.from('identity_events').insert({
        fingerprint_id: fingerprint_db_id,
        profile_id: profileId,
        event_type: 'profile_merged',
        event_data: { source, merged_with_existing: true },
        source,
      })

    } else {
      // Create new profile
      const nameParts = name?.split(' ') || []
      
      const { data: newProfile, error: profileError } = await supabase
        .from('visitor_profiles')
        .insert({
          email: email?.toLowerCase() || null,
          phone: phone?.replace(/\D/g, '') || null,
          full_name: name || null,
          first_name: nameParts[0] || null,
          last_name: nameParts.slice(1).join(' ') || null,
          status: 'identified',
        })
        .select('id')
        .single()

      if (profileError) {
        console.error('[Tracking] Profile insert error:', profileError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      profileId = newProfile.id
    }

    // Link fingerprint to profile
    await supabase
      .from('visitor_fingerprints')
      .update({ resolved_profile_id: profileId })
      .eq('id', fingerprint_db_id)

    // Log identity event
    const eventType = source === 'url_param' ? 'url_param_captured' : 
                      email ? 'email_captured' : 'phone_captured'
    
    await supabase.from('identity_events').insert({
      fingerprint_id: fingerprint_db_id,
      profile_id: profileId,
      event_type: eventType,
      event_data: { email, phone, name },
      source,
    })

    // Trigger N8N enrichment webhook if configured
    if (N8N_ENRICHMENT_WEBHOOK && (email || phone)) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add authentication header if secret is configured
      if (N8N_WEBHOOK_SECRET) {
        headers['Authorization'] = `Bearer ${N8N_WEBHOOK_SECRET}`
      }

      fetch(N8N_ENRICHMENT_WEBHOOK, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profile_id: profileId,
          fingerprint_id: fingerprint_db_id,
          email,
          phone,
          name,
          source,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('[Tracking] N8N webhook error:', err))
    }

    return NextResponse.json({ 
      success: true, 
      profile_id: profileId,
      was_merged: !!existingProfile,
    })

  } catch (error) {
    console.error('[Tracking] Identify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

