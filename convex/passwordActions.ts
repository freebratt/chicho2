"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Argon2id } from "oslo/password";
import { internal, api } from "./_generated/api";

/**
 * Hash password using Argon2id (Node runtime required for crypto)
 */
export const hashPassword = internalAction({
  args: {
    password: v.string(),
  },
  handler: async (_ctx, args) => {
    const argon2id = new Argon2id();
    const hash = await argon2id.hash(args.password);
    return hash;
  },
});

/**
 * Create admin account with password
 * This is the main entry point - call this from CLI
 */
export const createAdminWithPassword = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; userId: any }> => {
    // First, check if user exists
    const user: any = await ctx.runQuery(api.users.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error(`Používateľ s emailom ${args.email} neexistuje`);
    }

    // Hash the password in Node runtime
    const argon2id = new Argon2id();
    const passwordHash = await argon2id.hash(args.password);

    // Call mutation to insert authAccount
    const result: any = await ctx.runMutation(internal.createAuthAccount.insertAuthAccount, {
      userId: user.id,
      email: args.email,
      passwordHash,
    });

    return result;
  },
});
