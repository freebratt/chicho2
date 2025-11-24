import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal mutation to insert authAccount with password hash
 * Called from internal action after hashing
 */
export const insertAuthAccount = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if authAccount already exists for this user with password provider
    const existingAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "password")
      )
      .first();

    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        secret: args.passwordHash,
      });
      return { success: true, message: "Heslo bolo aktualizované", userId: args.userId };
    }

    // Create new authAccount record
    await ctx.db.insert("authAccounts", {
      userId: args.userId,
      provider: "password",
      providerAccountId: args.email,
      secret: args.passwordHash,
    });

    return { success: true, message: "Heslo bolo nastavené", userId: args.userId };
  },
});
