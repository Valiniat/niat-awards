export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      nominations: {
        Row: {
          id: string
          created_at: string
          type: "student" | "teacher"
          student_name: string | null
          student_class: string | null
          class_group: string | null
          school_name: string | null
          phone: string
          teacher_name: string | null
          award_category: string
          special_thing: string | null
          subject: string | null
          impact_story: string | null
          board: string | null
          care_rating: number | null
          clarity_rating: number | null
          motivation_rating: number | null
          support_rating: number | null
          full_name: string | null
          experience: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          type: "student" | "teacher"
          student_name?: string | null
          student_class?: string | null
          class_group?: string | null
          school_name?: string | null
          phone: string
          teacher_name?: string | null
          award_category: string
          special_thing?: string | null
          subject?: string | null
          impact_story?: string | null
          board?: string | null
          care_rating?: number | null
          clarity_rating?: number | null
          motivation_rating?: number | null
          support_rating?: number | null
          full_name?: string | null
          experience?: string | null
          status?: string
        }
        Update: Partial<Database["public"]["Tables"]["nominations"]["Insert"]>
      }
      votes: {
        Row: {
          id: string
          created_at: string
          nomination_id: string
          voter_phone: string
        }
        Insert: {
          id?: string
          created_at?: string
          nomination_id: string
          voter_phone: string
        }
        Update: Partial<Database["public"]["Tables"]["votes"]["Insert"]>
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
