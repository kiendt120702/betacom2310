import type { PublicTables } from "./schema-public-tables"
import type { PublicViews } from "./schema-public-views"
import type { PublicFunctions } from "./schema-public-functions"
import type { PublicEnums } from "./schema-public-enums"
import type { PublicCompositeTypes } from "./schema-public-composite-types"

export type PublicSchema = {
  Tables: PublicTables
  Views: PublicViews
  Functions: PublicFunctions
  Enums: PublicEnums
  CompositeTypes: PublicCompositeTypes
}