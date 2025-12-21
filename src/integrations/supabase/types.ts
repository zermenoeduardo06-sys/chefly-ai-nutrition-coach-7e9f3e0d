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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          key: string
          points_reward: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          key: string
          points_reward?: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_earned_mxn: number | null
          commission_paid_mxn: number | null
          commission_pending_mxn: number | null
          created_at: string
          id: string
          month: number
          total_amount_mxn: number | null
          total_sales: number | null
          updated_at: string
          year: number
        }
        Insert: {
          affiliate_id: string
          commission_earned_mxn?: number | null
          commission_paid_mxn?: number | null
          commission_pending_mxn?: number | null
          created_at?: string
          id?: string
          month: number
          total_amount_mxn?: number | null
          total_sales?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          affiliate_id?: string
          commission_earned_mxn?: number | null
          commission_paid_mxn?: number | null
          commission_pending_mxn?: number | null
          created_at?: string
          id?: string
          month?: number
          total_amount_mxn?: number | null
          total_sales?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount_mxn: number
          completed_at: string | null
          created_at: string
          id: string
          payout_details: Json | null
          payout_method: Database["public"]["Enums"]["payout_method"]
          processed_at: string | null
          rejection_reason: string | null
          requested_at: string
          status: Database["public"]["Enums"]["payout_status"] | null
          transaction_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount_mxn: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"] | null
          transaction_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount_mxn?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method?: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"] | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_profiles: {
        Row: {
          affiliate_code: string
          approved_at: string | null
          bank_account: string | null
          bank_clabe: string | null
          bank_name: string | null
          commission_rate_basic: number | null
          commission_rate_intermediate: number | null
          country: string | null
          created_at: string
          current_tier: Database["public"]["Enums"]["affiliate_tier"]
          email: string
          endorsely_affiliate_id: string | null
          endorsely_referral_link: string | null
          full_name: string
          id: string
          last_payout_at: string | null
          lifetime_sales_mxn: number | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          paypal_email: string | null
          pending_balance_mxn: number | null
          phone: string | null
          status: Database["public"]["Enums"]["affiliate_status"] | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_completed: boolean | null
          tier_upgraded_at: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_earned_mxn: number | null
          total_paid_mxn: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          approved_at?: string | null
          bank_account?: string | null
          bank_clabe?: string | null
          bank_name?: string | null
          commission_rate_basic?: number | null
          commission_rate_intermediate?: number | null
          country?: string | null
          created_at?: string
          current_tier?: Database["public"]["Enums"]["affiliate_tier"]
          email: string
          endorsely_affiliate_id?: string | null
          endorsely_referral_link?: string | null
          full_name: string
          id?: string
          last_payout_at?: string | null
          lifetime_sales_mxn?: number | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          paypal_email?: string | null
          pending_balance_mxn?: number | null
          phone?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"] | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          tier_upgraded_at?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earned_mxn?: number | null
          total_paid_mxn?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          approved_at?: string | null
          bank_account?: string | null
          bank_clabe?: string | null
          bank_name?: string | null
          commission_rate_basic?: number | null
          commission_rate_intermediate?: number | null
          country?: string | null
          created_at?: string
          current_tier?: Database["public"]["Enums"]["affiliate_tier"]
          email?: string
          endorsely_affiliate_id?: string | null
          endorsely_referral_link?: string | null
          full_name?: string
          id?: string
          last_payout_at?: string | null
          lifetime_sales_mxn?: number | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          paypal_email?: string | null
          pending_balance_mxn?: number | null
          phone?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"] | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          tier_upgraded_at?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earned_mxn?: number | null
          total_paid_mxn?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          clicked_at: string
          converted: boolean | null
          converted_at: string | null
          created_at: string
          id: string
          ip_address: string | null
          landing_page: string | null
          referrer_url: string | null
          sale_id: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          clicked_at?: string
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          sale_id?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          clicked_at?: string
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          sale_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sales: {
        Row: {
          affiliate_id: string
          approved_at: string | null
          commission_amount_mxn: number
          commission_rate: number
          commission_status:
            | Database["public"]["Enums"]["commission_status"]
            | null
          created_at: string
          customer_email: string
          customer_id: string | null
          endorsely_metadata: Json | null
          id: string
          paid_at: string | null
          plan_name: string
          product_id: string
          referral_id: string | null
          sale_amount_mxn: number
          stripe_customer_id: string | null
          stripe_metadata: Json | null
          stripe_subscription_id: string | null
        }
        Insert: {
          affiliate_id: string
          approved_at?: string | null
          commission_amount_mxn: number
          commission_rate: number
          commission_status?:
            | Database["public"]["Enums"]["commission_status"]
            | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          endorsely_metadata?: Json | null
          id?: string
          paid_at?: string | null
          plan_name: string
          product_id: string
          referral_id?: string | null
          sale_amount_mxn: number
          stripe_customer_id?: string | null
          stripe_metadata?: Json | null
          stripe_subscription_id?: string | null
        }
        Update: {
          affiliate_id?: string
          approved_at?: string | null
          commission_amount_mxn?: number
          commission_rate?: number
          commission_status?:
            | Database["public"]["Enums"]["commission_status"]
            | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          endorsely_metadata?: Json | null
          id?: string
          paid_at?: string | null
          plan_name?: string
          product_id?: string
          referral_id?: string | null
          sale_amount_mxn?: number
          stripe_customer_id?: string | null
          stripe_metadata?: Json | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sales_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_tiers: {
        Row: {
          benefits: Json | null
          color: string
          commission_bonus_percentage: number | null
          created_at: string
          display_order: number
          icon: string
          id: string
          min_conversions: number
          min_sales_mxn: number
          name_en: string
          name_es: string
          tier: Database["public"]["Enums"]["affiliate_tier"]
        }
        Insert: {
          benefits?: Json | null
          color: string
          commission_bonus_percentage?: number | null
          created_at?: string
          display_order: number
          icon: string
          id?: string
          min_conversions: number
          min_sales_mxn: number
          name_en: string
          name_es: string
          tier: Database["public"]["Enums"]["affiliate_tier"]
        }
        Update: {
          benefits?: Json | null
          color?: string
          commission_bonus_percentage?: number | null
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          min_conversions?: number
          min_sales_mxn?: number
          name_en?: string
          name_es?: string
          tier?: Database["public"]["Enums"]["affiliate_tier"]
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          arms: number | null
          chest: number | null
          created_at: string
          hips: number | null
          id: string
          measurement_date: string
          neck: number | null
          notes: string | null
          thighs: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arms?: number | null
          chest?: number | null
          created_at?: string
          hips?: number | null
          id?: string
          measurement_date: string
          neck?: number | null
          notes?: string | null
          thighs?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arms?: number | null
          chest?: number | null
          created_at?: string
          hips?: number | null
          id?: string
          measurement_date?: string
          neck?: number | null
          notes?: string | null
          thighs?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          bonus_description: string | null
          challenge_type: string
          created_at: string
          description: string
          expires_at: string
          id: string
          points_reward: number
          target_value: number
          title: string
          user_id: string
        }
        Insert: {
          bonus_description?: string | null
          challenge_type: string
          created_at?: string
          description: string
          expires_at: string
          id?: string
          points_reward?: number
          target_value: number
          title: string
          user_id: string
        }
        Update: {
          bonus_description?: string | null
          challenge_type?: string
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          points_reward?: number
          target_value?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string | null
          id: string
          invite_code: string
          max_members: number | null
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_code: string
          max_members?: number | null
          name?: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_code?: string
          max_members?: number | null
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_memberships: {
        Row: {
          family_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_memberships_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      food_scans: {
        Row: {
          calories: number | null
          carbs: number | null
          confidence: string | null
          created_at: string
          dish_name: string
          fat: number | null
          fiber: number | null
          foods_identified: string[] | null
          id: string
          image_url: string | null
          notes: string | null
          portion_estimate: string | null
          protein: number | null
          scanned_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          confidence?: string | null
          created_at?: string
          dish_name: string
          fat?: number | null
          fiber?: number | null
          foods_identified?: string[] | null
          id?: string
          image_url?: string | null
          notes?: string | null
          portion_estimate?: string | null
          protein?: number | null
          scanned_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          confidence?: string | null
          created_at?: string
          dish_name?: string
          fat?: number | null
          fiber?: number | null
          foods_identified?: string[] | null
          id?: string
          image_url?: string | null
          notes?: string | null
          portion_estimate?: string | null
          protein?: number | null
          scanned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          meal_id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          meal_id: string
          points_earned?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          meal_id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_completions_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_member_adaptations: {
        Row: {
          adaptation_notes: string | null
          adaptation_score: number
          created_at: string
          id: string
          is_best_match: boolean | null
          meal_id: string
          member_user_id: string
          variant_instructions: string | null
        }
        Insert: {
          adaptation_notes?: string | null
          adaptation_score?: number
          created_at?: string
          id?: string
          is_best_match?: boolean | null
          meal_id: string
          member_user_id: string
          variant_instructions?: string | null
        }
        Update: {
          adaptation_notes?: string | null
          adaptation_score?: number
          created_at?: string
          id?: string
          is_best_match?: boolean | null
          meal_id?: string
          member_user_id?: string
          variant_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_member_adaptations_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          family_id: string | null
          id: string
          is_family_plan: boolean | null
          preferences_hash: string | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_family_plan?: boolean | null
          preferences_hash?: string | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_family_plan?: boolean | null
          preferences_hash?: string | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          benefits: string
          calories: number | null
          carbs: number | null
          created_at: string | null
          day_of_week: number
          description: string
          fats: number | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          meal_plan_id: string
          meal_type: string
          name: string
          protein: number | null
          steps: string[] | null
        }
        Insert: {
          benefits: string
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          day_of_week: number
          description: string
          fats?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          meal_plan_id: string
          meal_type: string
          name: string
          protein?: number | null
          steps?: string[] | null
        }
        Update: {
          benefits?: string
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          day_of_week?: number
          description?: string
          fats?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          meal_plan_id?: string
          meal_type?: string
          name?: string
          protein?: number | null
          steps?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          achievement_alerts: boolean
          created_at: string
          daily_summary: boolean
          id: string
          meal_reminders: boolean
          reminder_times: Json
          streak_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_alerts?: boolean
          created_at?: string
          daily_summary?: boolean
          id?: string
          meal_reminders?: boolean
          reminder_times?: Json
          streak_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_alerts?: boolean
          created_at?: string
          daily_summary?: boolean
          id?: string
          meal_reminders?: boolean
          reminder_times?: Json
          streak_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_background_color: string | null
          avatar_config: Json | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_subscribed: boolean | null
          trial_expires_at: string | null
          trial_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_background_color?: string | null
          avatar_config?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          is_subscribed?: boolean | null
          trial_expires_at?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_background_color?: string | null
          avatar_config?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_subscribed?: boolean | null
          trial_expires_at?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_library: {
        Row: {
          allergies: string[] | null
          benefits: string | null
          calories: number | null
          carbs: number | null
          complexity: string | null
          cooking_time_minutes: number | null
          created_at: string
          description: string
          diet_type: string | null
          fats: number | null
          has_image: boolean | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          language: string | null
          meal_type: string
          name: string
          protein: number | null
          steps: string[] | null
          tags: string[] | null
        }
        Insert: {
          allergies?: string[] | null
          benefits?: string | null
          calories?: number | null
          carbs?: number | null
          complexity?: string | null
          cooking_time_minutes?: number | null
          created_at?: string
          description: string
          diet_type?: string | null
          fats?: number | null
          has_image?: boolean | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          language?: string | null
          meal_type: string
          name: string
          protein?: number | null
          steps?: string[] | null
          tags?: string[] | null
        }
        Update: {
          allergies?: string[] | null
          benefits?: string | null
          calories?: number | null
          carbs?: number | null
          complexity?: string | null
          cooking_time_minutes?: number | null
          created_at?: string
          description?: string
          diet_type?: string | null
          fats?: number | null
          has_image?: boolean | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          language?: string | null
          meal_type?: string
          name?: string
          protein?: number | null
          steps?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          items: string[]
          meal_plan_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: string[]
          meal_plan_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: string[]
          meal_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_period: string
          coming_soon: boolean
          created_at: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price_mxn: number
          updated_at: string
        }
        Insert: {
          billing_period?: string
          coming_soon?: boolean
          created_at?: string
          display_order: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_mxn: number
          updated_at?: string
        }
        Update: {
          billing_period?: string
          coming_soon?: boolean
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_mxn?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_challenges: {
        Row: {
          challenge_id: string
          completed_at: string
          created_at: string
          id: string
          is_completed: boolean
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          activity_level: string | null
          additional_notes: string | null
          age: number | null
          allergies: string[] | null
          budget: string | null
          cooking_skill: string | null
          cooking_time: number | null
          created_at: string | null
          diet_type: string
          dislikes: string[] | null
          flavor_preferences: string[] | null
          gender: string | null
          goal: string
          id: string
          meal_complexity: string | null
          meals_per_day: number
          preferred_cuisines: string[] | null
          servings: number | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          additional_notes?: string | null
          age?: number | null
          allergies?: string[] | null
          budget?: string | null
          cooking_skill?: string | null
          cooking_time?: number | null
          created_at?: string | null
          diet_type: string
          dislikes?: string[] | null
          flavor_preferences?: string[] | null
          gender?: string | null
          goal: string
          id?: string
          meal_complexity?: string | null
          meals_per_day?: number
          preferred_cuisines?: string[] | null
          servings?: number | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          additional_notes?: string | null
          age?: number | null
          allergies?: string[] | null
          budget?: string | null
          cooking_skill?: string | null
          cooking_time?: number | null
          created_at?: string | null
          diet_type?: string
          dislikes?: string[] | null
          flavor_preferences?: string[] | null
          gender?: string | null
          goal?: string
          id?: string
          meal_complexity?: string | null
          meals_per_day?: number
          preferred_cuisines?: string[] | null
          servings?: number | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
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
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          meals_completed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          meals_completed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          meals_completed?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan_id: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkins: {
        Row: {
          available_ingredients: string | null
          created_at: string
          custom_recipe_preference: string | null
          energy_level: string
          id: string
          recipe_preferences: string[] | null
          user_id: string
          week_start_date: string
          weekly_goals: string[] | null
          weight_change: string
        }
        Insert: {
          available_ingredients?: string | null
          created_at?: string
          custom_recipe_preference?: string | null
          energy_level: string
          id?: string
          recipe_preferences?: string[] | null
          user_id: string
          week_start_date: string
          weekly_goals?: string[] | null
          weight_change: string
        }
        Update: {
          available_ingredients?: string | null
          created_at?: string
          custom_recipe_preference?: string | null
          energy_level?: string
          id?: string
          recipe_preferences?: string[] | null
          user_id?: string
          week_start_date?: string
          weekly_goals?: string[] | null
          weight_change?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_affiliate_code: { Args: never; Returns: string }
      generate_family_invite_code: { Args: never; Returns: string }
      get_user_family_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_owner: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      update_affiliate_tier: {
        Args: { affiliate_profile_id: string }
        Returns: undefined
      }
    }
    Enums: {
      affiliate_status: "pending" | "active" | "suspended" | "inactive"
      affiliate_tier: "bronce" | "plata" | "oro" | "platino" | "diamante"
      app_role: "admin" | "moderator" | "user"
      commission_status: "pending" | "approved" | "paid" | "rejected"
      payout_method: "paypal" | "bank_transfer" | "spei"
      payout_status: "pending" | "processing" | "completed" | "failed"
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
      affiliate_status: ["pending", "active", "suspended", "inactive"],
      affiliate_tier: ["bronce", "plata", "oro", "platino", "diamante"],
      app_role: ["admin", "moderator", "user"],
      commission_status: ["pending", "approved", "paid", "rejected"],
      payout_method: ["paypal", "bank_transfer", "spei"],
      payout_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const
