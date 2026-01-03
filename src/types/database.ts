export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          slug: string
          brand: string
          model: string
          version: string | null
          year_manufacture: number
          year_model: number
          color: string
          mileage: number
          fuel_type: string
          transmission: string
          price: number
          category: string
          body_type: string
          location_id: string
          photos: string[]
          videos: string[] | null
          options: string[] | null
          description: string | null
          seo_title: string | null
          seo_description: string | null
          status: 'available' | 'reserved' | 'sold' | 'highlight'
          is_featured: boolean
          is_new: boolean
          created_at: string
          updated_at: string
          crm_id: string | null
          // Extended fields for cinematic experience
          horsepower: number | null
          torque: number | null
          acceleration: number | null
          top_speed: number | null
          engine: string | null
          origin: 'national' | 'imported' | null
          audio_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          phone: string
          whatsapp: string
          email: string
          latitude: number | null
          longitude: number | null
          hours: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          featured_image: string | null
          category_id: string
          tags: string[]
          author: string
          seo_title: string | null
          seo_description: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
      blog_categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['blog_categories']['Insert']>
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          vehicle_id: string | null
          source_page: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>
      }
      webhook_events: {
        Row: {
          id: string
          event_type: string
          payload: Json
          source_page: string
          vehicle_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['webhook_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['webhook_events']['Insert']>
      }
      vehicle_sounds: {
        Row: {
          id: string
          vehicle_id: string // AutoConf vehicle ID
          vehicle_name: string // Cached display name (e.g., "Ferrari 812 Superfast")
          vehicle_brand: string // Brand name for filtering
          sound_file_url: string // Path to uploaded audio file
          description: string | null // Sound description (e.g., "V12 naturally aspirated")
          icon: string // Emoji icon for display
          is_electric: boolean // Whether this is an electric vehicle
          is_active: boolean // Whether to show in public section
          display_order: number // Order in the sound section
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vehicle_sounds']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vehicle_sounds']['Insert']>
      }
      admin_sessions: {
        Row: {
          id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_sessions']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vehicle_status: 'available' | 'reserved' | 'sold' | 'highlight'
    }
  }
}

export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type WebhookEvent = Database['public']['Tables']['webhook_events']['Row']
export type VehicleSound = Database['public']['Tables']['vehicle_sounds']['Row']
export type AdminSession = Database['public']['Tables']['admin_sessions']['Row']
