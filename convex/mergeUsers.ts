import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Merge duplicate users by email.
 * Keeps the user with role, merges fields from duplicates, and deletes extras.
 */
export const mergeUsersByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Gather all users with that email
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .collect();

    if (users.length <= 1) {
      return { message: "No duplicates found", kept: users[0]?._id };
    }

    // Choose primary: prefer one with role field
    const primary = users.find((u) => u.role) ?? users[0];

    // Merge fields from duplicates into primary
    const patch: Record<string, any> = {};
    
    for (const u of users) {
      if (u._id === primary._id) continue;

      // Merge missing fields
      if (!primary.name && u.name) patch.name = u.name;
      if (!primary.role && u.role) patch.role = u.role;
      if (!primary.createdAt && u.createdAt) patch.createdAt = u.createdAt;
      if (!primary.emailVerificationTime && u.emailVerificationTime) {
        patch.emailVerificationTime = u.emailVerificationTime;
      }
    }

    // Apply patches if any
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(primary._id, patch);
    }

    // Delete duplicates
    for (const u of users) {
      if (u._id !== primary._id) {
        await ctx.db.delete(u._id);
      }
    }

    return {
      message: `Merged ${users.length} users into one`,
      kept: primary._id,
      deleted: users.length - 1,
    };
  },
});

/**
 * List all users grouped by email to find duplicates
 */
export const findDuplicates = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const byEmail: Record<string, typeof users> = {};
    for (const user of users) {
      const email = user.email;
      if (!email) continue; // Skip users without email
      
      if (!byEmail[email]) {
        byEmail[email] = [];
      }
      byEmail[email].push(user);
    }

    const duplicates = Object.entries(byEmail)
      .filter(([_, users]) => users.length > 1)
      .map(([email, users]) => ({
        email,
        count: users.length,
        users: users.map(u => ({
          id: u._id,
          name: u.name,
          role: u.role,
        })),
      }));

    return duplicates;
  },
});
