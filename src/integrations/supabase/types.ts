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
      admins: {
        Row: {
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          reserva_id: string | null
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
          reserva_id?: string | null
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
          reserva_id?: string | null
          tipo_inmueble?: string | null
          tipo_negocio?: string | null
          valor_aproximado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "captaciones_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "citas_reservas"
            referencedColumns: ["id"]
          },
        ]
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
          propietario_celular: string | null
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
          propietario_celular?: string | null
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
          propietario_celular?: string | null
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
      emergencia_buscadores: {
        Row: {
          acepta_politica: boolean
          celular: string
          ciudad: string
          fecha_creacion: string
          id: string
          nombre: string
          presupuesto: number | null
          tipo_inmueble: string | null
        }
        Insert: {
          acepta_politica?: boolean
          celular: string
          ciudad?: string
          fecha_creacion?: string
          id?: string
          nombre: string
          presupuesto?: number | null
          tipo_inmueble?: string | null
        }
        Update: {
          acepta_politica?: boolean
          celular?: string
          ciudad?: string
          fecha_creacion?: string
          id?: string
          nombre?: string
          presupuesto?: number | null
          tipo_inmueble?: string | null
        }
        Relationships: []
      }
      emergencia_inmuebles: {
        Row: {
          acepta_politica: boolean
          amoblado: boolean
          area_m2: number | null
          banos: number
          barrio: string | null
          canon: number
          celular: string
          ciudad: string
          comision_administracion: number
          condiciones_comision: string | null
          correo: string | null
          descripcion: string | null
          desea_administracion: boolean
          direccion: string | null
          estado: string
          fecha_actualizacion: string
          fecha_creacion: string
          foto_portada: string | null
          fotos: string[] | null
          habitaciones: number
          id: string
          incluye_administracion: boolean
          motivo_rechazo: string | null
          nombre: string
          parqueadero: string
          perfil: string
          piso: string | null
          sin_comision: boolean
          tipo_gestion: string | null
          tipo_inmueble: string
          token_gestion: string
          valor_administracion: number | null
        }
        Insert: {
          acepta_politica?: boolean
          amoblado?: boolean
          area_m2?: number | null
          banos?: number
          barrio?: string | null
          canon: number
          celular: string
          ciudad?: string
          comision_administracion?: number
          condiciones_comision?: string | null
          correo?: string | null
          descripcion?: string | null
          desea_administracion?: boolean
          direccion?: string | null
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto_portada?: string | null
          fotos?: string[] | null
          habitaciones?: number
          id?: string
          incluye_administracion?: boolean
          motivo_rechazo?: string | null
          nombre: string
          parqueadero?: string
          perfil: string
          piso?: string | null
          sin_comision?: boolean
          tipo_gestion?: string | null
          tipo_inmueble: string
          token_gestion?: string
          valor_administracion?: number | null
        }
        Update: {
          acepta_politica?: boolean
          amoblado?: boolean
          area_m2?: number | null
          banos?: number
          barrio?: string | null
          canon?: number
          celular?: string
          ciudad?: string
          comision_administracion?: number
          condiciones_comision?: string | null
          correo?: string | null
          descripcion?: string | null
          desea_administracion?: boolean
          direccion?: string | null
          estado?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto_portada?: string | null
          fotos?: string[] | null
          habitaciones?: number
          id?: string
          incluye_administracion?: boolean
          motivo_rechazo?: string | null
          nombre?: string
          parqueadero?: string
          perfil?: string
          piso?: string | null
          sin_comision?: boolean
          tipo_gestion?: string | null
          tipo_inmueble?: string
          token_gestion?: string
          valor_administracion?: number | null
        }
        Relationships: []
      }
      emergencia_swipes: {
        Row: {
          accion: string
          buscador_id: string | null
          fecha_creacion: string
          id: string
          inmueble_id: string
          session_id: string
        }
        Insert: {
          accion: string
          buscador_id?: string | null
          fecha_creacion?: string
          id?: string
          inmueble_id: string
          session_id: string
        }
        Update: {
          accion?: string
          buscador_id?: string | null
          fecha_creacion?: string
          id?: string
          inmueble_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergencia_swipes_buscador_id_fkey"
            columns: ["buscador_id"]
            isOneToOne: false
            referencedRelation: "emergencia_buscadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergencia_swipes_inmueble_id_fkey"
            columns: ["inmueble_id"]
            isOneToOne: false
            referencedRelation: "emergencia_inmuebles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergencia_swipes_inmueble_id_fkey"
            columns: ["inmueble_id"]
            isOneToOne: false
            referencedRelation: "emergencia_inmuebles_publicas"
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
          captacion_id: string | null
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
          propietario_id: string | null
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
          captacion_id?: string | null
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
          propietario_id?: string | null
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
          captacion_id?: string | null
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
          propietario_id?: string | null
          red_social_video?: string | null
          tipo_inmueble?: string
          tipo_negocio?: string
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propiedades_captacion_id_fkey"
            columns: ["captacion_id"]
            isOneToOne: false
            referencedRelation: "captaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propiedades_propietario_id_fkey"
            columns: ["propietario_id"]
            isOneToOne: false
            referencedRelation: "propietarios"
            referencedColumns: ["id"]
          },
        ]
      }
      propietarios: {
        Row: {
          apellido: string | null
          ciudad: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          notas: string | null
          numero_documento: string | null
          pais: string | null
          telefono: string | null
          tipo_documento: string | null
        }
        Insert: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          numero_documento?: string | null
          pais?: string | null
          telefono?: string | null
          tipo_documento?: string | null
        }
        Update: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          numero_documento?: string | null
          pais?: string | null
          telefono?: string | null
          tipo_documento?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      emergencia_inmuebles_publicas: {
        Row: {
          amoblado: boolean | null
          area_m2: number | null
          banos: number | null
          barrio: string | null
          canon: number | null
          ciudad: string | null
          descripcion: string | null
          fecha_creacion: string | null
          foto_portada: string | null
          fotos: string[] | null
          habitaciones: number | null
          id: string | null
          incluye_administracion: boolean | null
          parqueadero: string | null
          piso: string | null
          tipo_inmueble: string | null
          valor_administracion: number | null
        }
        Insert: {
          amoblado?: boolean | null
          area_m2?: number | null
          banos?: number | null
          barrio?: string | null
          canon?: number | null
          ciudad?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          foto_portada?: string | null
          fotos?: string[] | null
          habitaciones?: number | null
          id?: string | null
          incluye_administracion?: boolean | null
          parqueadero?: string | null
          piso?: string | null
          tipo_inmueble?: string | null
          valor_administracion?: number | null
        }
        Update: {
          amoblado?: boolean | null
          area_m2?: number | null
          banos?: number | null
          barrio?: string | null
          canon?: number | null
          ciudad?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          foto_portada?: string | null
          fotos?: string[] | null
          habitaciones?: number | null
          id?: string | null
          incluye_administracion?: boolean | null
          parqueadero?: string | null
          piso?: string | null
          tipo_inmueble?: string | null
          valor_administracion?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      emergencia_actualizar_estado: {
        Args: { p_nuevo_estado: string; p_token: string }
        Returns: {
          estado: string
          id: string
        }[]
      }
      emergencia_obtener_por_token: {
        Args: { p_token: string }
        Returns: {
          barrio: string
          canon: number
          ciudad: string
          estado: string
          fecha_creacion: string
          foto_portada: string
          id: string
          motivo_rechazo: string
          tipo_inmueble: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
