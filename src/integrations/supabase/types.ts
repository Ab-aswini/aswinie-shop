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
      categories: {
        Row: {
          category_type: string
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category_type?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category_type?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      consumer_ratings: {
        Row: {
          behavior_tags: string[] | null
          consumer_id: string
          created_at: string
          id: string
          vendor_id: string
        }
        Insert: {
          behavior_tags?: string[] | null
          consumer_id: string
          created_at?: string
          id?: string
          vendor_id: string
        }
        Update: {
          behavior_tags?: string[] | null
          consumer_id?: string
          created_at?: string
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          enhanced_image_url: string | null
          highlights: string[] | null
          id: string
          is_active: boolean | null
          name: string
          original_image_url: string | null
          price: number | null
          price_max: number | null
          style: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          enhanced_image_url?: string | null
          highlights?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          original_image_url?: string | null
          price?: number | null
          price_max?: number | null
          style?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          enhanced_image_url?: string | null
          highlights?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          original_image_url?: string | null
          price?: number | null
          price_max?: number | null
          style?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reported_vendor_id: string | null
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reported_vendor_id?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reported_vendor_id?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_vendor_id_fkey"
            columns: ["reported_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_shops: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_shops_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      vendor_ratings: {
        Row: {
          behavior_score: number | null
          behavior_tags: string[] | null
          comment: string | null
          created_at: string
          id: string
          product_quality: number | null
          user_id: string
          vendor_id: string
        }
        Insert: {
          behavior_score?: number | null
          behavior_tags?: string[] | null
          comment?: string | null
          created_at?: string
          id?: string
          product_quality?: number | null
          user_id: string
          vendor_id: string
        }
        Update: {
          behavior_score?: number | null
          behavior_tags?: string[] | null
          comment?: string | null
          created_at?: string
          id?: string
          product_quality?: number | null
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_name: string
          category_id: string | null
          city: string | null
          created_at: string
          description: string | null
          gst_number: string | null
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          shop_image_url: string | null
          slug: string
          status: string | null
          udyam_number: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string
          years_active: number | null
        }
        Insert: {
          business_name: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          gst_number?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          shop_image_url?: string | null
          slug: string
          status?: string | null
          udyam_number?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number: string
          years_active?: number | null
        }
        Update: {
          business_name?: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          gst_number?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          shop_image_url?: string | null
          slug?: string
          status?: string | null
          udyam_number?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string
          years_active?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendor" | "user"
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
      app_role: ["admin", "vendor", "user"],
    },
  },
} as const
