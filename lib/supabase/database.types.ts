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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["AuditActorType"]
          created_at: string
          diff: Json | null
          id: string
          ip: unknown
          property_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: Database["public"]["Enums"]["AuditActorType"]
          created_at?: string
          diff?: Json | null
          id?: string
          ip?: unknown
          property_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["AuditActorType"]
          created_at?: string
          diff?: Json | null
          id?: string
          ip?: unknown
          property_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_holds: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          expires_at: string
          guest_email: string
          guest_phone: string
          id: string
          payment_method: Database["public"]["Enums"]["PaymentMethod"]
          property_id: string
          room_type_id: string
          status: Database["public"]["Enums"]["HoldStatus"]
          total_cents: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          expires_at: string
          guest_email: string
          guest_phone: string
          id?: string
          payment_method: Database["public"]["Enums"]["PaymentMethod"]
          property_id: string
          room_type_id: string
          status?: Database["public"]["Enums"]["HoldStatus"]
          total_cents: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          expires_at?: string
          guest_email?: string
          guest_phone?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["PaymentMethod"]
          property_id?: string
          room_type_id?: string
          status?: Database["public"]["Enums"]["HoldStatus"]
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_holds_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_holds_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adults: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          check_in: string
          check_out: string
          children: number
          code: string
          created_at: string
          guest_country: string
          guest_document_number: string | null
          guest_document_type: string | null
          guest_email: string
          guest_full_name: string
          guest_phone: string
          id: string
          nights: number | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["PaymentMethod"]
          property_id: string
          public_token: string
          room_id: string | null
          room_type_id: string
          source: Database["public"]["Enums"]["BookingSource"]
          status: Database["public"]["Enums"]["BookingStatus"]
          total_cents: number
          updated_at: string
        }
        Insert: {
          adults?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in: string
          check_out: string
          children?: number
          code?: string
          created_at?: string
          guest_country?: string
          guest_document_number?: string | null
          guest_document_type?: string | null
          guest_email: string
          guest_full_name: string
          guest_phone: string
          id?: string
          nights?: number | null
          notes?: string | null
          payment_method: Database["public"]["Enums"]["PaymentMethod"]
          property_id: string
          public_token?: string
          room_id?: string | null
          room_type_id: string
          source?: Database["public"]["Enums"]["BookingSource"]
          status?: Database["public"]["Enums"]["BookingStatus"]
          total_cents: number
          updated_at?: string
        }
        Update: {
          adults?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in?: string
          check_out?: string
          children?: number
          code?: string
          created_at?: string
          guest_country?: string
          guest_document_number?: string | null
          guest_document_type?: string | null
          guest_email?: string
          guest_full_name?: string
          guest_phone?: string
          id?: string
          nights?: number | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["PaymentMethod"]
          property_id?: string
          public_token?: string
          room_id?: string | null
          room_type_id?: string
          source?: Database["public"]["Enums"]["BookingSource"]
          status?: Database["public"]["Enums"]["BookingStatus"]
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          id: string
          property_id: string | null
          resend_id: string | null
          status: Database["public"]["Enums"]["EmailStatus"]
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id?: string | null
          resend_id?: string | null
          status?: Database["public"]["Enums"]["EmailStatus"]
          subject: string
          template: string
          to_email: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string | null
          resend_id?: string | null
          status?: Database["public"]["Enums"]["EmailStatus"]
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      external_blocks: {
        Row: {
          end_date: string
          external_uid: string
          ical_feed_id: string
          id: string
          imported_at: string
          property_id: string
          room_id: string
          start_date: string
          summary: string | null
        }
        Insert: {
          end_date: string
          external_uid: string
          ical_feed_id: string
          id?: string
          imported_at?: string
          property_id: string
          room_id: string
          start_date: string
          summary?: string | null
        }
        Update: {
          end_date?: string
          external_uid?: string
          ical_feed_id?: string
          id?: string
          imported_at?: string
          property_id?: string
          room_id?: string
          start_date?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_blocks_ical_feed_id_fkey"
            columns: ["ical_feed_id"]
            isOneToOne: false
            referencedRelation: "ical_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_feeds: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["ICalDirection"]
          id: string
          is_active: boolean
          last_sync_error: string | null
          last_synced_at: string | null
          name: string
          property_id: string
          room_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["ICalDirection"]
          id?: string
          is_active?: boolean
          last_sync_error?: string | null
          last_synced_at?: string | null
          name: string
          property_id: string
          room_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["ICalDirection"]
          id?: string
          is_active?: boolean
          last_sync_error?: string | null
          last_synced_at?: string | null
          name?: string
          property_id?: string
          room_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ical_feeds_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ical_feeds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      login_events: {
        Row: {
          country: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["LoginEventType"]
          id: string
          ip: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["LoginEventType"]
          id?: string
          ip?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["LoginEventType"]
          id?: string
          ip?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          currency: string
          id: string
          method: Database["public"]["Enums"]["PaymentMethod"]
          proof_url: string | null
          property_id: string
          raw_payload: Json | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          updated_at: string
          wompi_payment_link_id: string | null
          wompi_reference: string | null
          wompi_transaction_id: string | null
        }
        Insert: {
          amount_cents: number
          booking_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          method: Database["public"]["Enums"]["PaymentMethod"]
          proof_url?: string | null
          property_id: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          updated_at?: string
          wompi_payment_link_id?: string | null
          wompi_reference?: string | null
          wompi_transaction_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["PaymentMethod"]
          proof_url?: string | null
          property_id?: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          updated_at?: string
          wompi_payment_link_id?: string | null
          wompi_reference?: string | null
          wompi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string
          phone: string | null
          role: Database["public"]["Enums"]["UserRole"]
          totp_enabled: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          totp_enabled?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          totp_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          booking_policy: Json | null
          check_in_time: string
          check_out_time: string
          city: string | null
          country: string
          cover_image_url: string | null
          created_at: string
          currency: string
          description_en: string | null
          description_es: string | null
          gallery: Json | null
          ical_export_secret: string | null
          id: string
          is_active: boolean
          max_stay_nights: number | null
          min_stay_nights: number
          name: string
          organization_id: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          booking_policy?: Json | null
          check_in_time?: string
          check_out_time?: string
          city?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_es?: string | null
          gallery?: Json | null
          ical_export_secret?: string | null
          id?: string
          is_active?: boolean
          max_stay_nights?: number | null
          min_stay_nights?: number
          name: string
          organization_id: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          booking_policy?: Json | null
          check_in_time?: string
          check_out_time?: string
          city?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_es?: string | null
          gallery?: Json | null
          ical_export_secret?: string | null
          id?: string
          is_active?: boolean
          max_stay_nights?: number | null
          min_stay_nights?: number
          name?: string
          organization_id?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_users: {
        Row: {
          created_at: string
          id: string
          invitation_accepted_at: string | null
          invited_by: string | null
          property_id: string
          role: Database["public"]["Enums"]["PropertyUserRole"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          property_id: string
          role: Database["public"]["Enums"]["PropertyUserRole"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          property_id?: string
          role?: Database["public"]["Enums"]["PropertyUserRole"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_users_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[] | null
          base_price_cents: number
          bed_configuration: string | null
          capacity_adults: number
          capacity_children: number
          created_at: string
          description_en: string | null
          description_es: string | null
          gallery: Json | null
          id: string
          is_active: boolean
          name_en: string | null
          name_es: string
          property_id: string
          size_m2: number | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          base_price_cents: number
          bed_configuration?: string | null
          capacity_adults: number
          capacity_children?: number
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          gallery?: Json | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_es: string
          property_id: string
          size_m2?: number | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          base_price_cents?: number
          bed_configuration?: string | null
          capacity_adults?: number
          capacity_children?: number
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          gallery?: Json | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_es?: string
          property_id?: string
          size_m2?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          floor: string | null
          id: string
          is_active: boolean
          notes: string | null
          number: string
          property_id: string
          room_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          number: string
          property_id: string
          room_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          number?: string
          property_id?: string
          room_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_rates: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string | null
          price_cents: number
          priority: number
          room_type_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name?: string | null
          price_cents: number
          priority?: number
          room_type_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string | null
          price_cents?: number
          priority?: number
          room_type_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_rates_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_configs: {
        Row: {
          access_token_encrypted: string | null
          business_account_id: string | null
          created_at: string
          is_active: boolean
          phone_number_id: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          business_account_id?: string | null
          created_at?: string
          is_active?: boolean
          phone_number_id?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          business_account_id?: string | null
          created_at?: string
          is_active?: boolean
          phone_number_id?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["MessageDirection"]
          error: string | null
          from_phone: string
          id: string
          meta_message_id: string | null
          property_id: string
          status: Database["public"]["Enums"]["WhatsappMessageStatus"]
          template_name: string | null
          to_phone: string
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["MessageDirection"]
          error?: string | null
          from_phone: string
          id?: string
          meta_message_id?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["WhatsappMessageStatus"]
          template_name?: string | null
          to_phone: string
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["MessageDirection"]
          error?: string | null
          from_phone?: string
          id?: string
          meta_message_id?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["WhatsappMessageStatus"]
          template_name?: string | null
          to_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      wompi_configs: {
        Row: {
          created_at: string
          events_secret_encrypted: string | null
          is_test_mode: boolean
          private_key_encrypted: string | null
          property_id: string
          public_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          events_secret_encrypted?: string | null
          is_test_mode?: boolean
          private_key_encrypted?: string | null
          property_id: string
          public_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          events_secret_encrypted?: string | null
          is_test_mode?: boolean
          private_key_encrypted?: string | null
          property_id?: string
          public_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wompi_configs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_availability: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_property_id: string
          p_room_type_id: string
        }
        Returns: {
          available_rooms: number
          total_rooms: number
        }[]
      }
      create_booking_hold: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guest_email: string
          p_guest_phone: string
          p_payment_method: string
          p_property_id: string
          p_room_type_id: string
          p_total_cents: number
          p_ttl_minutes: number
        }
        Returns: string
      }
      expire_old_holds: { Args: never; Returns: number }
      has_property_access: { Args: { p_property_id: string }; Returns: boolean }
      is_property_manager_or_above: {
        Args: { p_property_id: string }
        Returns: boolean
      }
      is_property_owner: { Args: { p_property_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      property_role: {
        Args: { p_property_id: string }
        Returns: Database["public"]["Enums"]["PropertyUserRole"]
      }
    }
    Enums: {
      AuditActorType: "user" | "system" | "webhook"
      BookingSource: "direct" | "booking_com" | "airbnb" | "manual"
      BookingStatus:
        | "pending_payment"
        | "confirmed"
        | "cancelled"
        | "no_show"
        | "completed"
      EmailStatus: "sent" | "delivered" | "bounced" | "complained"
      HoldStatus: "active" | "consumed" | "expired" | "cancelled"
      ICalDirection: "inbound" | "outbound"
      LoginEventType:
        | "login_success"
        | "login_failed"
        | "password_reset"
        | "twofa_enabled"
      MessageDirection: "inbound" | "outbound"
      PaymentMethod: "pse" | "manual_transfer" | "external" | "admin_override"
      PaymentStatus: "pending" | "approved" | "declined" | "voided" | "refunded"
      PropertyUserRole: "owner" | "manager" | "reception"
      UserRole:
        | "super_admin"
        | "owner"
        | "staff_manager"
        | "staff_reception"
        | "guest"
      WhatsappMessageStatus: "sent" | "delivered" | "read" | "failed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      AuditActorType: ["user", "system", "webhook"],
      BookingSource: ["direct", "booking_com", "airbnb", "manual"],
      BookingStatus: [
        "pending_payment",
        "confirmed",
        "cancelled",
        "no_show",
        "completed",
      ],
      EmailStatus: ["sent", "delivered", "bounced", "complained"],
      HoldStatus: ["active", "consumed", "expired", "cancelled"],
      ICalDirection: ["inbound", "outbound"],
      LoginEventType: [
        "login_success",
        "login_failed",
        "password_reset",
        "twofa_enabled",
      ],
      MessageDirection: ["inbound", "outbound"],
      PaymentMethod: ["pse", "manual_transfer", "external", "admin_override"],
      PaymentStatus: ["pending", "approved", "declined", "voided", "refunded"],
      PropertyUserRole: ["owner", "manager", "reception"],
      UserRole: [
        "super_admin",
        "owner",
        "staff_manager",
        "staff_reception",
        "guest",
      ],
      WhatsappMessageStatus: ["sent", "delivered", "read", "failed"],
    },
  },
} as const
