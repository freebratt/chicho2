import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time cleanup mutation to delete all auth accounts
export const deleteAllAuthAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
    return { deleted: accounts.length };
  },
});

// Delete specific auth account by provider account ID (email)
export const deleteAuthAccountByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), args.email))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
    
    return { deleted: accounts.length };
  },
});
