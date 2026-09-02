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
        Relationships: [
          {
            foreignKeyName: 'buddies_buddy_id_fkey';
            columns: ['buddy_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddies_buddy_id_fkey';
            columns: ['buddy_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddies_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddies_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'buddy_requests_buddy_id_fkey';
            columns: ['buddy_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddy_requests_buddy_id_fkey';
            columns: ['buddy_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddy_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddy_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      buddy_shares: {
        Row: {
          expires_at: string;
          id: string;
          token: string;
        };
        Insert: {
          expires_at?: string;
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
            foreignKeyName: 'buddy_shares_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'buddy_shares_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'drinks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'drinks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_drinks_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_drinks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_drinks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_invites_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_invites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_invites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_members_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_requests_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
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
          expires_at?: string;
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangout_shares_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
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
        Relationships: [
          {
            foreignKeyName: 'hangouts_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangouts_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          metadata: Json | null;
          read_at: string | null;
          type: Database['public']['Enums']['notification_types'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          metadata?: Json | null;
          read_at?: string | null;
          type: Database['public']['Enums']['notification_types'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          metadata?: Json | null;
          read_at?: string | null;
          type?: Database['public']['Enums']['notification_types'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sos_alerts: {
        Row: {
          hangout_id: string;
          lat: number | null;
          lon: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          hangout_id: string;
          lat?: number | null;
          lon?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          hangout_id?: string;
          lat?: number | null;
          lon?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sos_alerts_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sos_alerts_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sos_alerts_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sos_alerts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sos_alerts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
            referencedRelation: 'hangouts_feed';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'spots_hangout_id_fkey';
            columns: ['hangout_id'];
            isOneToOne: false;
            referencedRelation: 'my_hangout_ids';
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
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar: string | null;
          id: string;
          name: string | null;
          status: string | null;
        };
        Insert: {
          avatar?: string | null;
          id: string;
          name?: string | null;
          status?: string | null;
        };
        Update: {
          avatar?: string | null;
          id?: string;
          name?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      favorite_drink_ids: {
        Row: {
          count: number | null;
          id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'hangout_drinks_drink_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'drinks';
            referencedColumns: ['id'];
          },
        ];
      };
      hangouts_feed: {
        Row: {
          creator_id: string | null;
          ended_at: string | null;
          id: string | null;
          name: string | null;
          spot_image: string | null;
          spot_name: string | null;
          started_at: string | null;
          timezone: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'hangouts_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'my_buddies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hangouts_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      my_buddies: {
        Row: {
          avatar: string | null;
          created_at: string | null;
          id: string | null;
          name: string | null;
          status: string | null;
        };
        Relationships: [];
      };
      my_buddy_ids: {
        Row: {
          created_at: string | null;
          id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
        };
        Update: {
          created_at?: string | null;
          id?: never;
        };
        Relationships: [];
      };
      my_hangout_ids: {
        Row: {
          id: string | null;
        };
        Insert: {
          id?: string | null;
        };
        Update: {
          id?: string | null;
        };
        Relationships: [];
      };
      my_spot_ids: {
        Row: {
          id: string | null;
        };
        Insert: {
          id?: string | null;
        };
        Update: {
          id?: string | null;
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
      notification_types:
        | 'buddy_request'
        | 'hangout_request'
        | 'hangout_invite'
        | 'hangout_ended';
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
      notification_types: [
        'buddy_request',
        'hangout_request',
        'hangout_invite',
        'hangout_ended',
      ],
    },
  },
} as const;
