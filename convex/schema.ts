import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,
  
  // Override users table from authTables with custom fields
  users: defineTable({
    // Auth fields (keep optional as auth fills them)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    
    // Custom fields
    role: v.optional(v.union(v.literal("admin"), v.literal("pracovnik"))),
    totalVisits: v.optional(v.number()),
    lastLogin: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("email", ["email"])
    .index("by_role", ["role"]), // CRITICAL: for checking if admin exists
  
  // Logo management table
  logo: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),
  
  // Navod attachments table
  navodAttachments: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    navodId: v.string(),
  }).index("by_navod", ["navodId"]),
  
  // Tags table
  tags: defineTable({
    name: v.string(),
    typ: v.union(v.literal("typ-prace"), v.literal("produkt"), v.literal("pozicia")),
    color: v.optional(v.string()),
  }).index("by_name", ["name"])
    .index("by_typ", ["typ"]),
  
  // Main navody table (metadata)
  navody: defineTable({
    nazov: v.string(),
    slug: v.string(),
    videoUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    version: v.number(), // for optimistic concurrency
  }).index("by_slug", ["slug"])
    .index("by_updated", ["updatedAt"]),
  
  // Many-to-many join table for navody <-> tags (typ-prace)
  navodTypPrace: defineTable({
    navodId: v.id("navody"),
    tagId: v.id("tags"),
  }).index("by_navod", ["navodId"])
    .index("by_tag", ["tagId"]),
  
  // Many-to-many join table for navody <-> tags (produkt)
  navodProdukt: defineTable({
    navodId: v.id("navody"),
    tagId: v.id("tags"),
  }).index("by_navod", ["navodId"])
    .index("by_tag", ["tagId"]),
  
  // Potrebne naradie (small embedded array)
  navodNaradie: defineTable({
    navodId: v.id("navody"),
    order: v.number(),
    popis: v.string(),
  }).index("by_navod", ["navodId"]),
  
  // Postup prace - individual steps
  navodKroky: defineTable({
    navodId: v.id("navody"),
    cislo: v.number(),
    popis: v.string(),
  }).index("by_navod", ["navodId"])
    .index("by_navod_cislo", ["navodId", "cislo"]),
  
  // Na co si dat pozor
  navodPozor: defineTable({
    navodId: v.id("navody"),
    order: v.number(),
    popis: v.string(),
  }).index("by_navod", ["navodId"]),
  
  // Caste chyby
  navodChyby: defineTable({
    navodId: v.id("navody"),
    order: v.number(),
    popis: v.string(),
  }).index("by_navod", ["navodId"]),
  
  // Obrazky pre navody
  navodObrazky: defineTable({
    navodId: v.id("navody"),
    url: v.string(),
    cisloKroku: v.number(),
    popis: v.string(),
  }).index("by_navod", ["navodId"])
    .index("by_navod_krok", ["navodId", "cisloKroku"]),
  
  // Pripomienky (feedback)
  pripomienky: defineTable({
    navodId: v.id("navody"),
    userId: v.id("users"),
    sprava: v.string(),
    cisloKroku: v.optional(v.number()),
    stav: v.union(v.literal("nevybavena"), v.literal("vybavena")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_navod", ["navodId"])
    .index("by_user", ["userId"])
    .index("by_stav", ["stav"]),
  
  // Navod visits tracking
  navodNavstevy: defineTable({
    navodId: v.id("navody"),
    userId: v.id("users"),
    timestamp: v.number(),
    // Cached for display
    userName: v.string(),
    userEmail: v.string(),
    navodNazov: v.string(),
  }).index("by_navod", ["navodId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
  
  // User activity history
  userActivity: defineTable({
    userId: v.id("users"),
    typ: v.union(
      v.literal("prihlasenie"),
      v.literal("navsteva-navodu"),
      v.literal("vytvorenie-pripomienky"),
      v.literal("export-pdf"),
      v.literal("qr-generovanie")
    ),
    timestamp: v.number(),
    popis: v.string(),
    navodId: v.optional(v.id("navody")),
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
})
