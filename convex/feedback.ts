import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all feedback
export const getAllFeedback = query({
  handler: async (ctx) => {
    const feedback = await ctx.db.query("pripomienky").order("desc").collect();
    
    const feedbackWithDetails = await Promise.all(
      feedback.map(async (item) => {
        const [navod, user] = await Promise.all([
          ctx.db.get(item.navodId),
          ctx.db.get(item.userId),
        ]);

        return {
          id: item._id,
          navodId: item.navodId,
          navodNazov: navod?.nazov || "Neznámy návod",
          userId: item.userId,
          userName: user?.name || "Neznámy používateľ",
          userEmail: user?.email || "",
          sprava: item.sprava,
          cisloKroku: item.cisloKroku,
          stav: item.stav,
          createdAt: item.createdAt, // number
          resolvedAt: item.resolvedAt, // number | undefined
        };
      })
    );

    return feedbackWithDetails;
  },
});

// Get feedback by navod
export const getFeedbackByNavod = query({
  args: { navodId: v.id("navody") },
  handler: async (ctx, args) => {
    const feedback = await ctx.db
      .query("pripomienky")
      .withIndex("by_navod", (q) => q.eq("navodId", args.navodId))
      .collect();

    const feedbackWithDetails = await Promise.all(
      feedback.map(async (item) => {
        const user = await ctx.db.get(item.userId);
        return {
          id: item._id,
          userId: item.userId,
          userName: user?.name || "Neznámy používateľ",
          userEmail: user?.email || "",
          sprava: item.sprava,
          cisloKroku: item.cisloKroku,
          stav: item.stav,
          createdAt: item.createdAt, // number
          resolvedAt: item.resolvedAt, // number | undefined
        };
      })
    );

    return feedbackWithDetails;
  },
});

// Get unresolved feedback count
export const getUnresolvedCount = query({
  handler: async (ctx) => {
    const unresolved = await ctx.db
      .query("pripomienky")
      .withIndex("by_stav", (q) => q.eq("stav", "nevybavena"))
      .collect();
    return unresolved.length;
  },
});

// Create feedback
export const createFeedback = mutation({
  args: {
    navodId: v.id("navody"),
    userId: v.id("users"),
    sprava: v.string(),
    cisloKroku: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pripomienky", {
      navodId: args.navodId,
      userId: args.userId,
      sprava: args.sprava,
      cisloKroku: args.cisloKroku,
      stav: "nevybavena",
      createdAt: Date.now(),
    });
  },
});

// Mark feedback as resolved
export const resolveFeedback = mutation({
  args: { feedbackId: v.id("pripomienky") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId, {
      stav: "vybavena",
      resolvedAt: Date.now(),
    });
  },
});

// Delete feedback
export const deleteFeedback = mutation({
  args: { feedbackId: v.id("pripomienky") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.feedbackId);
  },
});
