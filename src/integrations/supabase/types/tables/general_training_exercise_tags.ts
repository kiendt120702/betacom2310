export type GeneralTrainingExerciseTags = {
  Row: {
    exercise_id: string
    tag_id: string
  }
  Insert: {
    exercise_id: string
    tag_id: string
  }
  Update: {
    exercise_id?: string
    tag_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "general_training_exercise_tags_exercise_id_fkey"
      columns: ["exercise_id"]
      isOneToOne: false
      referencedRelation: "general_training_exercises"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "general_training_exercise_tags_tag_id_fkey"
      columns: ["tag_id"]
      isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["id"]
    },
  ]
}