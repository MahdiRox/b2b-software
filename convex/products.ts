import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const adjustStock = mutation({
  args: { productId: v.id("products"), quantityChange: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const newStock = Math.max(0, product.stockQuantity + args.quantityChange);
    await ctx.db.patch(args.productId, { stockQuantity: newStock });
  },
});

export const bulkRestock = mutation({
  args: {
    intakes: v.array(
      v.object({
        productId: v.id("products"),
        quantityToAdd: v.number(),
      })
    ),
    supplierNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    for (const item of args.intakes) {
      if (item.quantityToAdd <= 0) continue;
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stockQuantity: product.stockQuantity + item.quantityToAdd,
        });
      }
    }
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    categoryId: v.id("categories"),
    pricePerUnit: v.number(),
    minOrderQuantity: v.number(),
    stockQuantity: v.number(),
    packageSize: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();

    if (existing) {
      throw new Error(`Product with SKU '${args.sku}' already exists.`);
    }

    return await ctx.db.insert("products", args);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    sku: v.string(),
    categoryId: v.id("categories"),
    pricePerUnit: v.number(),
    minOrderQuantity: v.number(),
    stockQuantity: v.number(),
    packageSize: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    // Check if new SKU conflicts
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", updateData.sku))
      .first();

    if (existing && existing._id !== id) {
      throw new Error(`Product with SKU '${updateData.sku}' already exists.`);
    }

    await ctx.db.patch(id, updateData);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    // Check for existing orders with this product before deleting
    const orders = await ctx.db.query("orders").collect();
    const hasOrders = orders.some(order => 
      order.items.some(item => item.productId === args.id)
    );
    
    if (hasOrders) {
      throw new Error("Cannot delete product: it is part of existing orders.");
    }
    
    await ctx.db.delete(args.id);
  },
});
