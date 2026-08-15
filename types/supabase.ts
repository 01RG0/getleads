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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_providers: {
        Row: {
          api_key_encrypted: string
          base_url: string
          cost_per_1k_input_tokens: number
          cost_per_1k_output_tokens: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority_order: number
          rate_limit_rpm: number
          rate_limit_tpm: number
          updated_at: string
        }
        Insert: {
          api_key_encrypted: string
          base_url: string
          cost_per_1k_input_tokens?: number
          cost_per_1k_output_tokens?: number
          created_at?: string
          id: string
          is_active?: boolean
          name: string
          priority_order?: number
          rate_limit_rpm?: number
          rate_limit_tpm?: number
          updated_at: string
        }
        Update: {
          api_key_encrypted?: string
          base_url?: string
          cost_per_1k_input_tokens?: number
          cost_per_1k_output_tokens?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority_order?: number
          rate_limit_rpm?: number
          rate_limit_tpm?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number
          created_at: string
          error_message: string | null
          id: string
          is_success: boolean
          latency_ms: number
          prompt_tokens: number
          provider_id: string | null
          task_type: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          id: string
          is_success?: boolean
          latency_ms: number
          prompt_tokens?: number
          provider_id?: string | null
          task_type: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          id?: string
          is_success?: boolean
          latency_ms?: number
          prompt_tokens?: number
          provider_id?: string | null
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_mcp_enabled: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id: string
          is_mcp_enabled?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_mcp_enabled?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          contact_id: string
          enrolled_at: string
          id: string
          status: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          enrolled_at?: string
          id: string
          status?: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          enrolled_at?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bounce_count: number
          created_at: string
          id: string
          name: string
          sent_count: number
          status: Database["public"]["Enums"]["CampaignStatus"]
          target_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          bounce_count?: number
          created_at?: string
          id: string
          name: string
          sent_count?: number
          status?: Database["public"]["Enums"]["CampaignStatus"]
          target_count?: number
          updated_at: string
          workspace_id: string
        }
        Update: {
          bounce_count?: number
          created_at?: string
          id?: string
          name?: string
          sent_count?: number
          status?: Database["public"]["Enums"]["CampaignStatus"]
          target_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          domain: string
          employee_count: number | null
          employee_range: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          name: string
          revenue_range: string | null
          state: string | null
          technographics: Json | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain: string
          employee_count?: number | null
          employee_range?: string | null
          id: string
          industry?: string | null
          linkedin_url?: string | null
          name: string
          revenue_range?: string | null
          state?: string | null
          technographics?: Json | null
          updated_at: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          domain?: string
          employee_count?: number | null
          employee_range?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          name?: string
          revenue_range?: string | null
          state?: string | null
          technographics?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          city: string | null
          company_id: string | null
          confidence_score: number
          country: string | null
          created_at: string
          department: string | null
          email: string | null
          email_status: Database["public"]["Enums"]["EmailStatus"]
          first_name: string
          id: string
          job_title: string
          last_name: string
          linkedin_url: string | null
          phone: string | null
          phone_type: Database["public"]["Enums"]["PhoneType"]
          seniority: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          city?: string | null
          company_id?: string | null
          confidence_score?: number
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_status?: Database["public"]["Enums"]["EmailStatus"]
          first_name: string
          id: string
          job_title: string
          last_name: string
          linkedin_url?: string | null
          phone?: string | null
          phone_type?: Database["public"]["Enums"]["PhoneType"]
          seniority?: string | null
          updated_at: string
          verified_at?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string | null
          confidence_score?: number
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_status?: Database["public"]["Enums"]["EmailStatus"]
          first_name?: string
          id?: string
          job_title?: string
          last_name?: string
          linkedin_url?: string | null
          phone?: string | null
          phone_type?: Database["public"]["Enums"]["PhoneType"]
          seniority?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["CreditTxType"]
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["CreditTxType"]
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["CreditTxType"]
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["OrgTier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["OrgTier"]
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["OrgTier"]
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          password_hash: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          password_hash: string
          updated_at: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          contact_id: string | null
          created_at: string
          email: string
          id: string
          is_catch_all: boolean
          is_disposable: boolean
          latency_ms: number
          mx_valid: boolean
          provider_used: string
          smtp_code: string | null
          smtp_response: string | null
          status: Database["public"]["Enums"]["EmailStatus"]
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          email: string
          id: string
          is_catch_all?: boolean
          is_disposable?: boolean
          latency_ms: number
          mx_valid?: boolean
          provider_used: string
          smtp_code?: string | null
          smtp_response?: string | null
          status: Database["public"]["Enums"]["EmailStatus"]
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_catch_all?: boolean
          is_disposable?: boolean
          latency_ms?: number
          mx_valid?: boolean
          provider_used?: string
          smtp_code?: string | null
          smtp_response?: string | null
          status?: Database["public"]["Enums"]["EmailStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["UserRole"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["UserRole"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["UserRole"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          credit_balance: number
          id: string
          monthly_credit_quota: number
          name: string
          organization_id: string
          parent_workspace_id: string | null
          type: Database["public"]["Enums"]["WorkspaceType"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_balance?: number
          id: string
          monthly_credit_quota?: number
          name: string
          organization_id: string
          parent_workspace_id?: string | null
          type?: Database["public"]["Enums"]["WorkspaceType"]
          updated_at: string
        }
        Update: {
          created_at?: string
          credit_balance?: number
          id?: string
          monthly_credit_quota?: number
          name?: string
          organization_id?: string
          parent_workspace_id?: string | null
          type?: Database["public"]["Enums"]["WorkspaceType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspaces_parent_workspace_id_fkey"
            columns: ["parent_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CampaignStatus: "draft" | "active" | "paused" | "completed" | "archived"
      CreditTxType:
        | "monthly_grant"
        | "topup_purchase"
        | "enrichment_deduction"
        | "verification_deduction"
        | "bounce_refund"
        | "agency_child_transfer"
        | "rollover_expire"
      EmailStatus:
        | "unverified"
        | "guaranteed_deliverable"
        | "deliverable_catch_all"
        | "risky"
        | "invalid"
        | "pending"
      OrgTier:
        | "free_trial"
        | "starter"
        | "pro_growth"
        | "agency_unlimited"
        | "enterprise"
      PhoneType: "mobile" | "direct_dial" | "switchboard" | "unknown"
      UserRole:
        | "super_admin"
        | "agency_owner"
        | "workspace_admin"
        | "member"
        | "read_only"
      WorkspaceType: "agency_parent" | "client_child" | "standalone"
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
      CampaignStatus: ["draft", "active", "paused", "completed", "archived"],
      CreditTxType: [
        "monthly_grant",
        "topup_purchase",
        "enrichment_deduction",
        "verification_deduction",
        "bounce_refund",
        "agency_child_transfer",
        "rollover_expire",
      ],
      EmailStatus: [
        "unverified",
        "guaranteed_deliverable",
        "deliverable_catch_all",
        "risky",
        "invalid",
        "pending",
      ],
      OrgTier: [
        "free_trial",
        "starter",
        "pro_growth",
        "agency_unlimited",
        "enterprise",
      ],
      PhoneType: ["mobile", "direct_dial", "switchboard", "unknown"],
      UserRole: [
        "super_admin",
        "agency_owner",
        "workspace_admin",
        "member",
        "read_only",
      ],
      WorkspaceType: ["agency_parent", "client_child", "standalone"],
    },
  },
} as const
