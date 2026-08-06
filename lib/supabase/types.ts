export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      buddies: {
        Row: {
          buddy_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          buddy_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          buddy_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      buddy_requests: {
        Row: {
          buddy_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          buddy_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          buddy_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      buddy_shares: {
        Row: {
          expires_at: string;
          id: string;
          token: string;
        };
        Insert: {
          expires_at: string;
          id: string;
          token: string;
        };
        Update: {
          expires_at?: string;
          id?: string;
          token?: string;
        };
        Relationships: [];
      };
      drinks: {
        Row: {
          abv: number;
          calories: number | null;
          category: Database['public']['Enums']['drink_categories'];
          id: string;
          name: string;
          user_id: string | null;
          volume: number | null;
        };
        Insert: {
          abv: number;
          calories?: number | null;
          category: Database['public']['Enums']['drink_categories'];
          id?: string;
          name: string;
          user_id?: string | null;
          volume?: number | null;
        };
        Update: {
          abv?: number;
          calories?: number | null;
          category?: Database['public']['Enums']['drink_categories'];
          id?: string;
          name?: string;
          user_id?: string | null;
          volume?: number | null;
        };
        Relationships: [];
      };
      hangout_drinks: {
        Row: {
          created_at: string;
          drink_id: string;
          hangout_id: string;
          id: string;
          user_id: string;
          volume: number;
        };
        Insert: {
          created_at?: string;
          drink_id: string;
          hangout_id: string;
          id?: string;
          user_id: string;
          volume: number;
        };
        Update: {
          created_at?: string;
          drink_id?: string;
          hangout_id?: string;
          id?: string;
          user_id?: string;
          volume?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_drinks_drink_id_fkey';
            columns: ['drink_id'];
            isOneToOne: false;
            referencedRelation: 'drinks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_drinks_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_drinks_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      hangout_invites: {
        Row: {
          created_at: string;
          hangout_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          hangout_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          hangout_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_invites_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_invites_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      hangout_members: {
        Row: {
          created_at: string;
          hangout_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          hangout_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          hangout_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_members_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_members_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      hangout_requests: {
        Row: {
          created_at: string;
          hangout_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          hangout_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          hangout_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_requests_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_requests_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      hangout_shares: {
        Row: {
          expires_at: string;
          id: string;
          token: string;
        };
        Insert: {
          expires_at: string;
          id: string;
          token: string;
        };
        Update: {
          expires_at?: string;
          id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_shares_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_shares_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      hangouts: {
        Row: {
          creator_id: string;
          ended_at: string | null;
          id: string;
          name: string;
          started_at: string;
          timezone: string;
        };
        Insert: {
          creator_id: string;
          ended_at?: string | null;
          id?: string;
          name: string;
          started_at?: string;
          timezone: string;
        };
        Update: {
          creator_id?: string;
          ended_at?: string | null;
          id?: string;
          name?: string;
          started_at?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      spots: {
        Row: {
          created_at: string;
          google_maps_id: string;
          hangout_id: string;
          id: string;
          image: string | null;
          lat: number;
          lon: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          google_maps_id: string;
          hangout_id: string;
          id?: string;
          image?: string | null;
          lat: number;
          lon: number;
          name: string;
        };
        Update: {
          created_at?: string;
          google_maps_id?: string;
          hangout_id?: string;
          id?: string;
          image?: string | null;
          lat?: number;
          lon?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'spots_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spots_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangouts';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          birth_date: string;
          gender: Database['public']['Enums']['gender'];
          height: number;
          id: string;
          weight: number;
        };
        Insert: {
          birth_date: string;
          gender: Database['public']['Enums']['gender'];
          height: number;
          id: string;
          weight: number;
        };
        Update: {
          birth_date?: string;
          gender?: Database['public']['Enums']['gender'];
          height?: number;
          id?: string;
          weight?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      my_buddies: {
        Row: {
          id: string | null;
        };
        Relationships: [];
      };
      my_hangouts: {
        Row: {
          creator_id: string | null;
          ended_at: string | null;
          id: string | null;
          name: string | null;
          started_at: string | null;
          timezone: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      drink_categories: 'beer' | 'cider' | 'wine' | 'cocktail' | 'spirit';
      gender: 'male' | 'female';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      drink_categories: ['beer', 'cider', 'wine', 'cocktail', 'spirit'],
      gender: ['male', 'female'],
    },
  },
} as const;
