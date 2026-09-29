import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listIncoming = query({
  args: {},
  handler: async (ctx) => {
    // Orders sorted by creation time implicitly using order("desc") inside Convex
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    newStatus: v.union(
      v.literal("Pending"),
      v.literal("Validated"),
      v.literal("In Delivery"),
      v.literal("Paid")
    ),
  },
  handler: async (ctx, args) => {
    // Atomic status transition ensures strict integrity under concurrent modifications
    await ctx.db.patch(args.orderId, { status: args.newStatus });
  },
});

export const createOrder = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Validate each item, check stock, and decrement product stock
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} was not found.`);
      }
      if (item.quantity < product.minOrderQuantity) {
        throw new Error(
          `Minimum order quantity for '${product.name}' is ${product.minOrderQuantity} units.`
        );
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient warehouse stock for '${product.name}'. Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
        );
      }
      // Decrement stock upon order placement
      await ctx.db.patch(product._id, {
        stockQuantity: product.stockQuantity - item.quantity,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      wilaya: args.wilaya,
      status: args.status,
      totalAmountDA: args.totalAmountDA,
      items: args.items,
      notes: args.notes,
      createdAt: Date.now(),
    });

    return orderId;
  },
});

export const deleteOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    // If order is cancelled/deleted before being paid, restore stock
    if (order.status === "Pending" || order.status === "Validated") {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (product) {
          await ctx.db.patch(product._id, {
            stockQuantity: product.stockQuantity + item.quantity,
          });
        }
      }
    }
    await ctx.db.delete(args.orderId);
  },
});
