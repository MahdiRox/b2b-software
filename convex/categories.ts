import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Category with slug '${args.slug}' already exists.`);
    }

    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", data.slug))
      .first();

    if (existing && existing._id !== id) {
      throw new Error(`Category with slug '${data.slug}' already exists.`);
    }

    await ctx.db.patch(id, data);
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // Prevent deletion if products still belong to this category
    const products = await ctx.db.query("products").collect();
    const hasProducts = products.some((p) => p.categoryId === args.id);

    if (hasProducts) {
      throw new Error(
        "Cannot delete category: products are assigned to this category. Reassign or remove them first."
      );
    }

    await ctx.db.delete(args.id);
  },
});
