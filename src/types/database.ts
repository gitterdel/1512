export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          status: string;
          verified: boolean;
          created_at: string;
          last_login: string;
          avatar_url: string | null;
          phone: string | null;
          location: string | null;
          date_of_birth: string | null;
          bio: string | null;
          verified_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: string;
          status?: string;
          verified?: boolean;
          created_at?: string;
          last_login?: string;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          verified_at?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          role?: string;
          status?: string;
          verified?: boolean;
          last_login?: string;
          avatar_url?: string | null;
          phone?: string | null;
          location?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          verified_at?: string | null;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          location: string;
          type: string;
          landlord_id: string;
          images: string[];
          features: Record<string, any>;
          amenities: string[];
          status: string;
          created_at: string;
          updated_at: string | null;
          verified: boolean;
          verified_at: string | null;
          hidden: boolean;
          views: number;
          rating: number;
          availability_schedule: Record<string, any>;
          contact_preferences: Record<string, any>;
          reports: Record<string, any>[];
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          location: string;
          type: string;
          landlord_id: string;
          images?: string[];
          features?: Record<string, any>;
          amenities?: string[];
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          hidden?: boolean;
          views?: number;
          rating?: number;
          availability_schedule?: Record<string, any>;
          contact_preferences?: Record<string, any>;
          reports?: Record<string, any>[];
        };
        Update: {
          title?: string;
          description?: string;
          price?: number;
          location?: string;
          type?: string;
          images?: string[];
          features?: Record<string, any>;
          amenities?: string[];
          status?: string;
          updated_at?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          hidden?: boolean;
          views?: number;
          rating?: number;
          availability_schedule?: Record<string, any>;
          contact_preferences?: Record<string, any>;
          reports?: Record<string, any>[];
        };
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};