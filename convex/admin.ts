import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Safe one-time admin creation mutation.
 * - If no admin exists: allows creation with setup token (from secrets)
 * - If admin exists: requires authenticated admin to create new admins
 */
export const createInitialAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    setupToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any admin already exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    const callerId = await getAuthUserId(ctx);

    // If an admin already exists, require the caller to be an authenticated admin
    if (existingAdmin) {
      if (!callerId) {
        throw new Error("Admin už existuje. Musíte sa prihlásiť ako admin.");
      }
      const caller = await ctx.db.get(callerId);
      if (!caller || caller.role !== "admin") {
        throw new Error("Prístup odmietnutý: vyžaduje sa admin oprávnenie.");
      }
      
      // Authenticated admin creating another admin
      const now = Date.now();
      const newId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        role: "admin" as const,
        emailVerificationTime: now,
        createdAt: now,
        totalVisits: 0,
      });
      return newId;
    }

    // No admin exists -> allow one-time creation with setup token
    const setupSecret = process.env.ADMIN_SETUP_TOKEN;
    
    if (setupSecret) {
      if (!args.setupToken || args.setupToken !== setupSecret) {
        throw new Error("Neplatný setup token. Skontrolujte Settings → Secrets v Macaly.");
      }
    }
    
    // Create the first admin
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "admin" as const,
      emailVerificationTime: now, // Mark email as verified
      createdAt: now,
      totalVisits: 0,
    });
    
    return id;
  },
});
