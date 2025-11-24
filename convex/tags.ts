import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all tags
export const getAllTags = query({
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").collect();
    return tags.map(tag => ({
      id: tag._id,
      name: tag.name,
      typ: tag.typ,
      color: tag.color,
    }));
  },
});

// Get tags by type
export const getTagsByType = query({
  args: { typ: v.union(v.literal("typ-prace"), v.literal("produkt"), v.literal("pozicia")) },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_typ", (q) => q.eq("typ", args.typ))
      .collect();
    return tags.map(tag => ({
      id: tag._id,
      name: tag.name,
      typ: tag.typ,
      color: tag.color,
    }));
  },
});

// Create or update tag
export const upsertTag = mutation({
  args: {
    name: v.string(),
    typ: v.union(v.literal("typ-prace"), v.literal("produkt"), v.literal("pozicia")),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        typ: args.typ,
        color: args.color,
      });
      return existing._id;
    }

    return await ctx.db.insert("tags", {
      name: args.name,
      typ: args.typ,
      color: args.color,
    });
  },
});

// Create new tag (for admin page)
export const createTag = mutation({
  args: {
    nazov: v.string(),
    typ: v.union(v.literal("typ-prace"), v.literal("produkt")),
    farba: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", {
      name: args.nazov,
      typ: args.typ,
      color: args.farba,
    });
  },
});

// Delete tag
export const deleteTag = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    // Check if tag is in use
    const inTypPrace = await ctx.db
      .query("navodTypPrace")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .first();
    
    const inProdukt = await ctx.db
      .query("navodProdukt")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .first();

    if (inTypPrace || inProdukt) {
      throw new Error("Tag je použitý v návodoch a nemôže byť odstránený");
    }

    await ctx.db.delete(args.tagId);
  },
});
