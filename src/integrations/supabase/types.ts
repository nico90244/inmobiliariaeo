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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      captaciones: {
        Row: {
          barrio: string | null
          celular: string | null
          correo: string | null
          estado: string | null
          fecha_creacion: string
          id: string
          nombre: string | null
          observaciones: string | null
          tipo_inmueble: string | null
          tipo_negocio: string | null
          valor_aproximado: string | null
        }
        Insert: {
          barrio?: string | null
          celular?: string | null
          correo?: string | null
          estado?: string | null
          fecha_creacion?: string
          id?: string
          nombre?: string | null
          observaciones?: string | null
          tipo_inmueble?: string | null
          tipo_negocio?: string | null
          valor_aproximado?: string | null
        }
        Update: {
          barrio?: string | null
          celular?: string | null
          correo?: string | null
          estado?: string | null
          fecha_creacion?: string
          id?: string
          nombre?: string | null
          observaciones?: string | null
          tipo_inmueble?: string | null
          tipo_negocio?: string | null
          valor_aproximado?: string | null
        }
        Relationships: []
      }
      citas_disponibles: {
        Row: {
          activo: boolean
          agente: string
          estado: string
          fecha: string
          fecha_creacion: string
          hora: string
          id: string
          propiedad_id: string | null
        }
        Insert: {
          activo?: boolean
          agente?: string
          estado?: string
          fecha: string
          fecha_creacion?: string
          hora: string
          id?: string
          propiedad_id?: string | null
        }
        Update: {
          activo?: boolean
          agente?: string
          estado?: string
          fecha?: string
          fecha_creacion?: string
          hora?: string
          id?: string
          propiedad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_disponibles_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      citas_reservas: {
        Row: {
          celular_cliente: string
          correo_cliente: string | null
          estado: string
          fecha_creacion: string
          id: string
          nombre_cliente: string
          propiedad_id: string | null
          slot_id: string | null
        }
        Insert: {
          celular_cliente: string
          correo_cliente?: string | null
          estado?: string
          fecha_creacion?: string
          id?: string
          nombre_cliente: string
          propiedad_id?: string | null
          slot_id?: string | null
        }
        Update: {
          celular_cliente?: string
          correo_cliente?: string | null
          estado?: string
          fecha_creacion?: string
          id?: string
          nombre_cliente?: string
          propiedad_id?: string | null
          slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_reservas_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_reservas_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "citas_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          administracion: number | null
          area_m2: number | null
          banos: number | null
          barrio: string | null
          ciudad: string | null
          descripcion: string | null
          destacada: boolean
          direccion: string | null
          estado: string
          estrato: number | null
          fecha_actualizacion: string
          fecha_creacion: string
          foto_portada: string | null
          foto_portada_position: string | null
          fotos: string[] | null
          habitaciones: number | null
          id: string
          link_video: string | null
          link_whatsapp: string | null
          nombre_inmueble: string
          parqueadero: string | null
          piso: string | null
          precio: number | null
          red_social_video: string | null
          tipo_inmueble: string
          tipo_negocio: string
          zona: string | null
        }
        Insert: {
          administracion?: number | null
          area_m2?: number | null
          banos?: number | null
          barrio?: string | null
          ciudad?: string | null
          descripcion?: string | null
          destacada?: boolean
          direccion?: string | null
          estado?: string
          estrato?: number | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto_portada?: string | null
          foto_portada_position?: string | null
          fotos?: string[] | null
          habitaciones?: number | null
          id?: string
          link_video?: string | null
          link_whatsapp?: string | null
          nombre_inmueble: string
          parqueadero?: string | null
          piso?: string | null
          precio?: number | null
          red_social_video?: string | null
          tipo_inmueble: string
          tipo_negocio?: string
          zona?: string | null
        }
        Update: {
          administracion?: number | null
          area_m2?: number | null
          banos?: number | null
          barrio?: string | null
          ciudad?: string | null
          descripcion?: string | null
          destacada?: boolean
          direccion?: string | null
          estado?: string
          estrato?: number | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto_portada?: string | null
          foto_portada_position?: string | null
          fotos?: string[] | null
          habitaciones?: number | null
          id?: string
          link_video?: string | null
          link_whatsapp?: string | null
          nombre_inmueble?: string
          parqueadero?: string | null
          piso?: string | null
          precio?: number | null
          red_social_video?: string | null
          tipo_inmueble?: string
          tipo_negocio?: string
          zona?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
