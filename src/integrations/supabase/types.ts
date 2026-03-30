export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean | null
          label: string
          lat: number | null
          lng: number | null
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string
          zip_code: string
          zone_id: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label: string
          lat?: number | null
          lng?: number | null
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string
          zip_code: string
          zone_id?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string
          lat?: number | null
          lng?: number | null
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          user_id?: string
          zip_code?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          state: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          state: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      client_plans: {
        Row: {
          active: boolean | null
          cleanings_per_month: number
          created_at: string
          features: Json | null
          fee_discount_percent: number | null
          id: string
          monthly_price: number
          name: string
          priority_boost: number | null
          type: Database["public"]["Enums"]["client_plan_type"]
        }
        Insert: {
          active?: boolean | null
          cleanings_per_month: number
          created_at?: string
          features?: Json | null
          fee_discount_percent?: number | null
          id?: string
          monthly_price: number
          name: string
          priority_boost?: number | null
          type: Database["public"]["Enums"]["client_plan_type"]
        }
        Update: {
          active?: boolean | null
          cleanings_per_month?: number
          created_at?: string
          features?: Json | null
          fee_discount_percent?: number | null
          id?: string
          monthly_price?: number
          name?: string
          priority_boost?: number | null
          type?: Database["public"]["Enums"]["client_plan_type"]
        }
        Relationships: []
      }
      client_subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          renew_at: string | null
          start_at: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          renew_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          renew_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "client_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_uses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_order_value: number | null
          uses_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_order_value?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_order_value?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      matching_logs: {
        Row: {
          candidates: Json
          chosen_pro_id: string | null
          created_at: string
          id: string
          order_id: string
          reason: string | null
        }
        Insert: {
          candidates: Json
          chosen_pro_id?: string | null
          created_at?: string
          id?: string
          order_id: string
          reason?: string | null
        }
        Update: {
          candidates?: Json
          chosen_pro_id?: string | null
          created_at?: string
          id?: string
          order_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_id: string
          base_price: number
          client_id: string
          client_rating: number | null
          client_review: string | null
          completed_at: string | null
          created_at: string
          discount: number | null
          duration_hours: number
          id: string
          notes: string | null
          pro_id: string | null
          pro_rating: number | null
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          surge_multiplier: number | null
          total_price: number
          updated_at: string
          zone_fee: number | null
        }
        Insert: {
          address_id: string
          base_price: number
          client_id: string
          client_rating?: number | null
          client_review?: string | null
          completed_at?: string | null
          created_at?: string
          discount?: number | null
          duration_hours: number
          id?: string
          notes?: string | null
          pro_id?: string | null
          pro_rating?: number | null
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          surge_multiplier?: number | null
          total_price: number
          updated_at?: string
          zone_fee?: number | null
        }
        Update: {
          address_id?: string
          base_price?: number
          client_id?: string
          client_rating?: number | null
          client_review?: string | null
          completed_at?: string | null
          created_at?: string
          discount?: number | null
          duration_hours?: number
          id?: string
          notes?: string | null
          pro_id?: string | null
          pro_rating?: number | null
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          surge_multiplier?: number | null
          total_price?: number
          updated_at?: string
          zone_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          asaas_payment_id: string | null
          asaas_status: string | null
          boleto_url: string | null
          created_at: string
          external_id: string | null
          id: string
          invoice_url: string | null
          method: string
          order_id: string
          pix_copy_paste: string | null
          pix_qr_code: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          asaas_status?: string | null
          boleto_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          method: string
          order_id: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          asaas_status?: string | null
          boleto_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          method?: string
          order_id?: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_declined_orders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_declined_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string | null
          file_url: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name?: string | null
          file_url: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string | null
          file_url?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_metrics: {
        Row: {
          acceptance_rate: number | null
          cancel_rate: number | null
          id: string
          last_30d_jobs: number | null
          last_7d_cancels: number | null
          on_time_rate: number | null
          quality_level: Database["public"]["Enums"]["quality_level"] | null
          response_time_avg: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acceptance_rate?: number | null
          cancel_rate?: number | null
          id?: string
          last_30d_jobs?: number | null
          last_7d_cancels?: number | null
          on_time_rate?: number | null
          quality_level?: Database["public"]["Enums"]["quality_level"] | null
          response_time_avg?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acceptance_rate?: number | null
          cancel_rate?: number | null
          id?: string
          last_30d_jobs?: number | null
          last_7d_cancels?: number | null
          on_time_rate?: number | null
          quality_level?: Database["public"]["Enums"]["quality_level"] | null
          response_time_avg?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_plans: {
        Row: {
          access_categories: Json | null
          active: boolean | null
          created_at: string
          features: Json | null
          id: string
          monthly_price: number
          name: string
          priority_boost: number | null
          type: Database["public"]["Enums"]["pro_plan_type"]
        }
        Insert: {
          access_categories?: Json | null
          active?: boolean | null
          created_at?: string
          features?: Json | null
          id?: string
          monthly_price: number
          name: string
          priority_boost?: number | null
          type: Database["public"]["Enums"]["pro_plan_type"]
        }
        Update: {
          access_categories?: Json | null
          active?: boolean | null
          created_at?: string
          features?: Json | null
          id?: string
          monthly_price?: number
          name?: string
          priority_boost?: number | null
          type?: Database["public"]["Enums"]["pro_plan_type"]
        }
        Relationships: []
      }
      pro_profiles: {
        Row: {
          available_now: boolean | null
          bio: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          jobs_done: number | null
          radius_km: number | null
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          available_now?: boolean | null
          bio?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          jobs_done?: number | null
          radius_km?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          available_now?: boolean | null
          bio?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          jobs_done?: number | null
          radius_km?: number | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      pro_subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          renew_at: string | null
          start_at: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          renew_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          renew_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pro_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_zones: {
        Row: {
          created_at: string
          id: string
          user_id: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_zones_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          asaas_customer_id: string | null
          avatar_url: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asaas_customer_id?: string | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          details: Json
          estimated_value: number | null
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          details: Json
          estimated_value?: number | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          details?: Json
          estimated_value?: number | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_rules: {
        Row: {
          active: boolean | null
          address_id: string | null
          created_at: string
          id: string
          service_id: string | null
          subscription_id: string
          time: string
          weekday: number
        }
        Insert: {
          active?: boolean | null
          address_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          subscription_id: string
          time: string
          weekday: number
        }
        Update: {
          active?: boolean | null
          address_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          subscription_id?: string
          time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurring_rules_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_rules_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          created_at: string
          credited_at: string | null
          id: string
          referral_id: string
          status: string | null
          type: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          credited_at?: string | null
          id?: string
          referral_id: string
          status?: string | null
          type: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          credited_at?: string | null
          id?: string
          referral_id?: string
          status?: string | null
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string
          id: string
          referee_id: string | null
          referrer_id: string
          reward_value: number | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["referral_status"] | null
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referrer_id: string
          reward_value?: number | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referrer_id?: string
          reward_value?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Relationships: []
      }
      risk_actions: {
        Row: {
          action: string
          active: boolean | null
          created_at: string
          end_at: string | null
          id: string
          reason: string | null
          start_at: string
          user_id: string
        }
        Insert: {
          action: string
          active?: boolean | null
          created_at?: string
          end_at?: string | null
          id?: string
          reason?: string | null
          start_at?: string
          user_id: string
        }
        Update: {
          action?: string
          active?: boolean | null
          created_at?: string
          end_at?: string | null
          id?: string
          reason?: string | null
          start_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_flags: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          resolved: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          severity: Database["public"]["Enums"]["risk_severity"] | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          resolved?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          severity?: Database["public"]["Enums"]["risk_severity"] | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          resolved?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          severity?: Database["public"]["Enums"]["risk_severity"] | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          base_price: number
          created_at: string
          description: string | null
          duration_hours: number
          icon: string | null
          id: string
          name: string
          requires_pro_plan: boolean
        }
        Insert: {
          active?: boolean | null
          base_price: number
          created_at?: string
          description?: string | null
          duration_hours: number
          icon?: string | null
          id?: string
          name: string
          requires_pro_plan?: boolean
        }
        Update: {
          active?: boolean | null
          base_price?: number
          created_at?: string
          description?: string | null
          duration_hours?: number
          icon?: string | null
          id?: string
          name?: string
          requires_pro_plan?: boolean
        }
        Relationships: []
      }
      sla_rules: {
        Row: {
          active: boolean | null
          cancel_rate_max_percent: number | null
          created_at: string
          id: string
          on_time_target_percent: number | null
          response_time_target_min: number | null
        }
        Insert: {
          active?: boolean | null
          cancel_rate_max_percent?: number | null
          created_at?: string
          id?: string
          on_time_target_percent?: number | null
          response_time_target_min?: number | null
        }
        Update: {
          active?: boolean | null
          cancel_rate_max_percent?: number | null
          created_at?: string
          id?: string
          on_time_target_percent?: number | null
          response_time_target_min?: number | null
        }
        Relationships: []
      }
      subscription_credits: {
        Row: {
          created_at: string
          credits_total: number
          credits_used: number | null
          id: string
          month_ref: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          credits_total: number
          credits_used?: number | null
          id?: string
          month_ref: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          credits_total?: number
          credits_used?: number | null
          id?: string
          month_ref?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_credits_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_attachments: {
        Row: {
          created_at: string
          filename: string | null
          id: string
          ticket_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          filename?: string | null
          id?: string
          ticket_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          filename?: string | null
          id?: string
          ticket_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          order_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          asaas_transfer_id: string | null
          created_at: string
          encrypted_bank_info: string | null
          encrypted_pix_key: string | null
          id: string
          method: string
          processed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          asaas_transfer_id?: string | null
          created_at?: string
          encrypted_bank_info?: string | null
          encrypted_pix_key?: string | null
          id?: string
          method: string
          processed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          asaas_transfer_id?: string | null
          created_at?: string
          encrypted_bank_info?: string | null
          encrypted_pix_key?: string | null
          id?: string
          method?: string
          processed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zone_rules: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          min_pros_online: number | null
          surge_multiplier: number | null
          zone_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          min_pros_online?: number | null
          surge_multiplier?: number | null
          zone_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          min_pros_online?: number | null
          surge_multiplier?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_rules_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: true
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          active: boolean | null
          center_lat: number | null
          center_lng: number | null
          city_id: string
          created_at: string
          fee_extra: number | null
          id: string
          name: string
          radius_km: number | null
        }
        Insert: {
          active?: boolean | null
          center_lat?: number | null
          center_lng?: number | null
          city_id: string
          created_at?: string
          fee_extra?: number | null
          id?: string
          name: string
          radius_km?: number | null
        }
        Update: {
          active?: boolean | null
          center_lat?: number | null
          center_lng?: number | null
          city_id?: string
          created_at?: string
          fee_extra?: number | null
          id?: string
          name?: string
          radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      withdrawals_secure: {
        Row: {
          amount: number | null
          bank_info: Json | null
          created_at: string | null
          id: string | null
          method: string | null
          pix_key: string | null
          processed_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          bank_info?: never
          created_at?: string | null
          id?: string | null
          method?: string | null
          pix_key?: never
          processed_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          bank_info?: never
          created_at?: string | null
          id?: string | null
          method?: string | null
          pix_key?: never
          processed_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_pro_available_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      decrypt_field: { Args: { encrypted_text: string }; Returns: string }
      encrypt_field: { Args: { plain_text: string }; Returns: string }
      find_nearest_zone: {
        Args: { p_lat: number; p_lng: number }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "client" | "pro" | "company"
      client_plan_type: "basic" | "plus" | "premium"
      order_status:
        | "draft"
        | "scheduled"
        | "matching"
        | "confirmed"
        | "en_route"
        | "in_progress"
        | "completed"
        | "rated"
        | "paid_out"
        | "cancelled"
        | "in_review"
      pro_plan_type: "free" | "pro" | "elite"
      quality_level: "A" | "B" | "C" | "D"
      referral_status: "pending" | "completed" | "expired" | "cancelled"
      risk_severity: "low" | "medium" | "high" | "critical"
      subscription_status: "active" | "paused" | "cancelled" | "expired"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "pro", "company"],
      client_plan_type: ["basic", "plus", "premium"],
      order_status: [
        "draft",
        "scheduled",
        "matching",
        "confirmed",
        "en_route",
        "in_progress",
        "completed",
        "rated",
        "paid_out",
        "cancelled",
        "in_review",
      ],
      pro_plan_type: ["free", "pro", "elite"],
      quality_level: ["A", "B", "C", "D"],
      referral_status: ["pending", "completed", "expired", "cancelled"],
      risk_severity: ["low", "medium", "high", "critical"],
      subscription_status: ["active", "paused", "cancelled", "expired"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
