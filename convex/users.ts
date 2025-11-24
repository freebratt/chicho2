import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all users
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt, // number
      lastLogin: user.lastLogin, // number | undefined
      totalVisits: user.totalVisits,
    }));
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt, // number
      lastLogin: user.lastLogin, // number | undefined
      totalVisits: user.totalVisits,
    };
  },
});

// Create or update user
export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("pracovnik")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
        lastLogin: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      createdAt: now,
      totalVisits: 0,
    });
  },
});

// Create new user (for admin page)
export const createUser = mutation({
  args: {
    meno: v.string(),
    email: v.string(),
    hesloHash: v.string(),
    uroven: v.union(v.literal("admin"), v.literal("pracovnik")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      name: args.meno,
      email: args.email,
      // passwordHash intentionally omitted because the auth users table doesn't define it
      role: args.uroven,
      createdAt: now,
      totalVisits: 0,
    });
  },
});

// Update existing user (for admin page)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    meno: v.string(),
    email: v.string(),
    uroven: v.union(v.literal("admin"), v.literal("pracovnik")),
    hesloHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      name: args.meno,
      email: args.email,
      role: args.uroven,
    };
    
    // Note: We ignore hesloHash because password storage is managed by auth provider
    
    await ctx.db.patch(args.userId, updateData);
    return args.userId;
  },
});

// Update user last login
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLogin: Date.now(),
    });
  },
});

// Increment user visit count
export const incrementVisitCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        totalVisits: (user.totalVisits ?? 0) + 1,
      });
    }
  },
});

// Delete user
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

// Create admin user (simplified)
export const createAdminUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user ID (must be called after signIn with password provider)
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Používateľ nie je autentifikovaný. Najprv sa prihláste.");
    }

    const now = Date.now();
    
    // Update the auth user document with profile data
    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
      role: "admin" as const,
      createdAt: now,
      totalVisits: 0,
      lastLogin: now,
    });
    
    return userId;
  },
});

// Create pracovnik user (for creating workers)
export const createPracovnikUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user ID (must be called after signIn with password provider)
    const userId = await getAuthUserId(ctx);
    
    if (!userId) {
      throw new Error("Používateľ nie je autentifikovaný. Najprv sa prihláste.");
    }

    const now = Date.now();
    
    // Update the auth user document with profile data
    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
      role: "pracovnik" as const,
      createdAt: now,
      totalVisits: 0,
      lastLogin: now,
    });
    
    return userId;
  },
});
