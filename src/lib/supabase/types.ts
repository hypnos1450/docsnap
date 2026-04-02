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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro'
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro'
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          status: 'draft' | 'generating' | 'completed' | 'failed'
          steps_count: number
          export_format: 'markdown' | 'pdf' | 'html'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title?: string
          status?: 'draft' | 'generating' | 'completed' | 'failed'
          steps_count?: number
          export_format?: 'markdown' | 'pdf' | 'html'
        }
        Update: {
          title?: string
          status?: 'draft' | 'generating' | 'completed' | 'failed'
          steps_count?: number
          export_format?: 'markdown' | 'pdf' | 'html'
        }
      }
      document_steps: {
        Row: {
          id: string
          document_id: string
          step_number: number
          title: string
          description: string
          image_url: string
          annotations: string[]
          tip: string | null
          order_index: number
        }
        Insert: {
          document_id: string
          step_number: number
          title: string
          description: string
          image_url: string
          annotations: string[]
          tip?: string | null
          order_index: number
        }
        Update: {
          step_number?: number
          title?: string
          description?: string
          image_url?: string
          annotations?: string[]
          tip?: string | null
          order_index?: number
        }
      }
    }
  }
}
