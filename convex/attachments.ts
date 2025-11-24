import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for attachments
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save attachment metadata after upload
export const saveAttachment = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    navodId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("navodAttachments", {
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      navodId: args.navodId,
      uploadedAt: Date.now(),
    });
  },
});

// Get attachment by navod ID
export const getAttachmentByNavodId = query({
  args: { navodId: v.string() },
  handler: async (ctx, args) => {
    const attachment = await ctx.db
      .query("navodAttachments")
      .withIndex("by_navod", (q) => q.eq("navodId", args.navodId))
      .first();
    
    if (!attachment) return null;
    
    const url = await ctx.storage.getUrl(attachment.storageId);
    
    return {
      ...attachment,
      url,
    };
  },
});

// Get ALL attachments by navod ID (for multiple attachments)
export const getAttachmentsByNavodId = query({
  args: { navodId: v.string() },
  handler: async (ctx, args) => {
    const attachments = await ctx.db
      .query("navodAttachments")
      .withIndex("by_navod", (q) => q.eq("navodId", args.navodId))
      .collect();
    
    if (!attachments || attachments.length === 0) return [];
    
    // Get URLs for all attachments
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (attachment) => {
        const url = await ctx.storage.getUrl(attachment.storageId);
        return {
          ...attachment,
          url,
        };
      })
    );
    
    return attachmentsWithUrls;
  },
});

// Delete attachment
export const deleteAttachment = mutation({
  args: { 
    attachmentId: v.id("navodAttachments"),
  },
  handler: async (ctx, args) => {
    const attachment = await ctx.db.get(args.attachmentId);
    
    if (!attachment) {
      throw new Error("Attachment not found");
    }
    
    // Try to delete from storage, but continue even if it fails
    try {
      await ctx.storage.delete(attachment.storageId);
    } catch (error) {
      console.error('Storage file not found, but will delete DB record:', error);
    }
    
    // Delete from database
    await ctx.db.delete(args.attachmentId);
    
    return { success: true };
  },
});

// Delete attachment by navod ID
export const deleteAttachmentByNavodId = mutation({
  args: { navodId: v.string() },
  handler: async (ctx, args) => {
    const attachment = await ctx.db
      .query("navodAttachments")
      .withIndex("by_navod", (q) => q.eq("navodId", args.navodId))
      .first();
    
    if (!attachment) {
      return { success: false, message: "No attachment found" };
    }
    
    // Delete from storage
    await ctx.storage.delete(attachment.storageId);
    
    // Delete from database
    await ctx.db.delete(attachment._id);
    
    return { success: true };
  },
});

// Delete ALL attachments by navod ID
export const deleteAllAttachmentsByNavodId = mutation({
  args: { navodId: v.string() },
  handler: async (ctx, args) => {
    const attachments = await ctx.db
      .query("navodAttachments")
      .withIndex("by_navod", (q) => q.eq("navodId", args.navodId))
      .collect();
    
    if (!attachments || attachments.length === 0) {
      return { success: true, message: "No attachments found", deletedCount: 0 };
    }
    
    // Delete all attachments from storage and database
    let deletedCount = 0;
    for (const attachment of attachments) {
      try {
        await ctx.storage.delete(attachment.storageId);
        await ctx.db.delete(attachment._id);
        deletedCount++;
      } catch (error) {
        console.error('Error deleting attachment:', attachment._id, error);
      }
    }
    
    return { success: true, deletedCount };
  },
});



