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
      contratos_arrendamiento: {
        Row: {
          created_at: string
          dia_pago_inquilino: number | null
          dia_pago_propietario: number | null
          docs_codeudor: string[]
          docs_inquilino: string[]
          estado_contrato: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          inquilino_cedula: string
          inquilino_celular: string
          inquilino_correo: string | null
          inquilino_nombre: string
          notas: string | null
          poliza_asegurado: boolean
          poliza_compania: string | null
          poliza_compania_otra: string | null
          poliza_fecha_inicio: string | null
          poliza_valor: number | null
          propiedad_id: string
          propietario_banco: string | null
          propietario_cedula: string | null
          propietario_nombre: string | null
          propietario_num_cuenta: string | null
          propietario_tipo_cuenta: string | null
          updated_at: string
          valor_canon: number | null
          valor_pago_propietario: number | null
        }
        Insert: {
          created_at?: string
          dia_pago_inquilino?: number | null
          dia_pago_propietario?: number | null
          docs_codeudor?: string[]
          docs_inquilino?: string[]
          estado_contrato?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          inquilino_cedula: string
          inquilino_celular: string
          inquilino_correo?: string | null
          inquilino_nombre: string
          notas?: string | null
          poliza_asegurado?: boolean
          poliza_compania?: string | null
          poliza_compania_otra?: string | null
          poliza_fecha_inicio?: string | null
          poliza_valor?: number | null
          propiedad_id: string
          propietario_banco?: string | null
          propietario_cedula?: string | null
          propietario_nombre?: string | null
          propietario_num_cuenta?: string | null
          propietario_tipo_cuenta?: string | null
          updated_at?: string
          valor_canon?: number | null
          valor_pago_propietario?: number | null
        }
        Update: {
          created_at?: string
          dia_pago_inquilino?: number | null
          dia_pago_propietario?: number | null
          docs_codeudor?: string[]
          docs_inquilino?: string[]
          estado_contrato?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          inquilino_cedula?: string
          inquilino_celular?: string
          inquilino_correo?: string | null
          inquilino_nombre?: string
          notas?: string | null
          poliza_asegurado?: boolean
          poliza_compania?: string | null
          poliza_compania_otra?: string | null
          poliza_fecha_inicio?: string | null
          poliza_valor?: number | null
          propiedad_id?: string
          propietario_banco?: string | null
          propietario_cedula?: string | null
          propietario_nombre?: string | null
          propietario_num_cuenta?: string | null
          propietario_tipo_cuenta?: string | null
          updated_at?: string
          valor_canon?: number | null
          valor_pago_propietario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_arrendamiento_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_alquiler: {
        Row: {
          anio: number
          contrato_id: string
          created_at: string
          estado_inquilino: string
          estado_propietario: string
          fecha_pago_inquilino: string | null
          fecha_pago_propietario: string | null
          id: string
          mes: number
          notas: string | null
          updated_at: string
          valor_administracion: number | null
          valor_canon: number | null
          valor_propietario: number | null
          valor_recibido: number | null
        }
        Insert: {
          anio: number
          contrato_id: string
          created_at?: string
          estado_inquilino?: string
          estado_propietario?: string
          fecha_pago_inquilino?: string | null
          fecha_pago_propietario?: string | null
          id?: string
          mes: number
          notas?: string | null
          updated_at?: string
          valor_administracion?: number | null
          valor_canon?: number | null
          valor_propietario?: number | null
          valor_recibido?: number | null
        }
        Update: {
          anio?: number
          contrato_id?: string
          created_at?: string
          estado_inquilino?: string
          estado_propietario?: string
          fecha_pago_inquilino?: string | null
          fecha_pago_propietario?: string | null
          id?: string
          mes?: number
          notas?: string | null
          updated_at?: string
          valor_administracion?: number | null
          valor_canon?: number | null
          valor_propietario?: number | null
          valor_recibido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_alquiler_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_arrendamiento"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_poliza: {
        Row: {
          anio: number
          contrato_id: string
          created_at: string
          estado: string
          fecha_pago: string | null
          id: string
          mes: number | null
          notas: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          anio: number
          contrato_id: string
          created_at?: string
          estado?: string
          fecha_pago?: string | null
          id?: string
          mes?: number | null
          notas?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          anio?: number
          contrato_id?: string
          created_at?: string
          estado?: string
          fecha_pago?: string | null
          id?: string
          mes?: number | null
          notas?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_poliza_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_arrendamiento"
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
          foto_portada_pos: string | null
          foto_portada_position: string | null
          foto_portada_zoom: number | null
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
          foto_portada_pos?: string | null
          foto_portada_position?: string | null
          foto_portada_zoom?: number | null
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
          foto_portada_pos?: string | null
          foto_portada_position?: string | null
          foto_portada_zoom?: number | null
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
