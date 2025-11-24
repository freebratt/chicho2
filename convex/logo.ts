import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for logo
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save logo metadata after upload
export const saveLogo = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    // First, deactivate any existing active logo
    const existingLogos = await ctx.db
      .query("logo")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    for (const logo of existingLogos) {
      await ctx.db.patch(logo._id, { isActive: false });
    }
    
    // Save new logo as active
    return await ctx.db.insert("logo", {
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      uploadedAt: Date.now(),
      isActive: true,
    });
  },
});

// Get current active logo
export const getActiveLogo = query({
  args: {},
  handler: async (ctx) => {
    const logo = await ctx.db
      .query("logo")
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!logo) return null;
    
    const url = await ctx.storage.getUrl(logo.storageId);
    
    return {
      ...logo,
      url,
    };
  },
});

// Get logo URL by storage ID
export const getLogoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});