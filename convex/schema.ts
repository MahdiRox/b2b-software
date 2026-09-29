import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
  products: defineTable({
    name: v.string(),
    sku: v.string(),
    categoryId: v.id("categories"),
    pricePerUnit: v.number(),
    minOrderQuantity: v.number(),
    stockQuantity: v.number(),
    packageSize: v.string(),
  }).index("by_sku", ["sku"]),
  orders: defineTable({
    clientName: v.string(),
    clientPhone: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Validated"),
      v.literal("In Delivery"),
      v.literal("Paid")
    ),
    totalAmountDA: v.number(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        unitPriceDA: v.optional(v.number()),
      })
    ),
    notes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }),
});
