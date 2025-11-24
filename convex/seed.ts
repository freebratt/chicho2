import { internalMutation } from "./_generated/server";

/**
 * Seed the database with an admin user
 * Run with: npx convex run --no-push seed:seedAdmin
 */
export const seedAdmin = internalMutation({
    handler: async (ctx) => {
        // Check if admin already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", "admin@chicho.tech"))
            .first();

        if (existing) {
            return { success: true, message: "Admin user already exists", userId: existing._id };
        }

        // Create admin user
        const userId = await ctx.db.insert("users", {
            name: "Admin User",
            email: "admin@chicho.tech",
            role: "admin",
            createdAt: Date.now(),
            totalVisits: 0,
        });

        return { success: true, message: "Admin user created", userId };
    },
});
