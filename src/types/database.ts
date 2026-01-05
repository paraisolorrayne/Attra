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
      // CRM Tables
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string | null
          email: string | null
          cpf_cnpj: string | null
          origem_principal: OrigemCliente
          faixa_valor_preferida_min: number | null
          faixa_valor_preferida_max: number | null
          tipos_preferidos: string[]
          marcas_preferidas: string[]
          criado_em: string
          atualizado_em: string
        }
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'criado_em' | 'atualizado_em'>
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
      }
      leads: {
        Row: {
          id: string
          origem: OrigemLead
          payload_bruto: Json
          cliente_id: string | null
          nome: string
          telefone: string | null
          email: string | null
          interesse_tipo: InteresseTipo | null
          faixa_preco_interesse_min: number | null
          faixa_preco_interesse_max: number | null
          categoria_interesse: string | null
          marca_interesse: string | null
          modelo_interesse: string | null
          prioridade: PrioridadeLead
          status: StatusLead
          criado_em: string
          atualizado_em: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'criado_em' | 'atualizado_em'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      eventos_lead: {
        Row: {
          id: string
          lead_id: string
          tipo: EventoLeadTipo
          descricao: string | null
          proximo_contato_em: string | null
          responsavel: string
          webhook_disparado: boolean
          criado_em: string
        }
        Insert: Omit<Database['public']['Tables']['eventos_lead']['Row'], 'id' | 'criado_em'>
        Update: Partial<Database['public']['Tables']['eventos_lead']['Insert']>
      }
      historico_compras: {
        Row: {
          id: string
          cliente_id: string
          veiculo_id_externo: string | null
          data_compra: string
          valor_compra: number
          categoria: string | null
          marca: string | null
          modelo: string | null
          status: StatusCompra
          loja: string | null
          vendedor: string | null
          descricao: string | null
          criado_em: string
        }
        Insert: Omit<Database['public']['Tables']['historico_compras']['Row'], 'id' | 'criado_em'>
        Update: Partial<Database['public']['Tables']['historico_compras']['Insert']>
      }
      boletos: {
        Row: {
          id: string
          cliente_id: string
          lead_id: string | null
          identificador_externo: string | null
          nosso_numero: string | null
          linha_digitavel: string | null
          descricao: string
          valor_total: number
          data_emissao: string
          data_vencimento: string
          data_pagamento: string | null
          status: StatusBoleto
          forma_cobranca: FormaCobranca
          origem: OrigemBoleto
          criado_em: string
          atualizado_em: string
        }
        Insert: Omit<Database['public']['Tables']['boletos']['Row'], 'id' | 'criado_em' | 'atualizado_em'>
        Update: Partial<Database['public']['Tables']['boletos']['Insert']>
      }
      eventos_boleto: {
        Row: {
          id: string
          boleto_id: string
          tipo: EventoBoletoTipo
          descricao: string | null
          data_evento: string
          criado_em: string
        }
        Insert: Omit<Database['public']['Tables']['eventos_boleto']['Row'], 'id' | 'criado_em'>
        Update: Partial<Database['public']['Tables']['eventos_boleto']['Insert']>
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
      origem_cliente: OrigemCliente
      origem_lead: OrigemLead
      interesse_tipo: InteresseTipo
      prioridade_lead: PrioridadeLead
      status_lead: StatusLead
      evento_lead_tipo: EventoLeadTipo
      status_compra: StatusCompra
      status_boleto: StatusBoleto
      forma_cobranca: FormaCobranca
      origem_boleto: OrigemBoleto
      evento_boleto_tipo: EventoBoletoTipo
    }
  }
}

// CRM Enum Types
export type OrigemCliente = 'site' | 'whatsapp' | 'indicacao' | 'crm_externo'
export type OrigemLead = 'site_chat' | 'whatsapp_ia' | 'instagram_form' | 'crm_externo'
export type InteresseTipo = 'comprar' | 'vender' | 'ambos'
export type PrioridadeLead = 'baixa' | 'media' | 'alta'
export type StatusLead = 'novo' | 'em_atendimento' | 'concluido' | 'perdido' | 'ganho'
export type EventoLeadTipo = 'criado' | 'contato_realizado' | 'retorno_pendente' | 'sem_resposta' | 'ganho' | 'perdido'
export type StatusCompra = 'ativo' | 'vendido' | 'trocado'
export type StatusBoleto = 'pendente' | 'vencido' | 'pago' | 'cancelado' | 'em_negociacao'
export type FormaCobranca = 'boleto' | 'pix_copia_cola' | 'link_pagamento'
export type OrigemBoleto = 'manual' | 'gateway_x' | 'sistema_y'
export type EventoBoletoTipo = 'criado' | 'enviado' | 'lembranca' | 'pago' | 'cancelado' | 'renegociado'

// Existing Table Types
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type WebhookEvent = Database['public']['Tables']['webhook_events']['Row']
export type VehicleSound = Database['public']['Tables']['vehicle_sounds']['Row']
export type AdminSession = Database['public']['Tables']['admin_sessions']['Row']

// CRM Table Types
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert']
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']

export type EventoLead = Database['public']['Tables']['eventos_lead']['Row']
export type EventoLeadInsert = Database['public']['Tables']['eventos_lead']['Insert']

export type HistoricoCompra = Database['public']['Tables']['historico_compras']['Row']
export type HistoricoCompraInsert = Database['public']['Tables']['historico_compras']['Insert']

export type Boleto = Database['public']['Tables']['boletos']['Row']
export type BoletoInsert = Database['public']['Tables']['boletos']['Insert']
export type BoletoUpdate = Database['public']['Tables']['boletos']['Update']

export type EventoBoleto = Database['public']['Tables']['eventos_boleto']['Row']
export type EventoBoletoInsert = Database['public']['Tables']['eventos_boleto']['Insert']

// Extended types with relations
export interface ClienteWithStats extends Cliente {
  lead_count: number
  purchase_count: number
  total_spent: number
  last_purchase_date: string | null
}

export interface LeadWithCliente extends Lead {
  cliente?: Cliente | null
  eventos?: EventoLead[]
  proximo_contato?: string | null
}

export interface BoletoWithCliente extends Boleto {
  cliente: Cliente
  lead?: Lead | null
  dias_em_atraso?: number
}
