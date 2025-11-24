import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration function to import data from localStorage
export const migrateFromLocalStorage = mutation({
  args: {
    navody: v.array(v.any()),
    tags: v.array(v.any()),
    users: v.array(v.any()),
    feedback: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const results = {
      tags: [] as string[],
      users: [] as string[],
      navody: [] as string[],
      feedback: [] as string[],
    };

    // 1. Migrate tags first
    const tagIdMap = new Map<string, any>();
    for (const tag of args.tags) {
      const existing = await ctx.db
        .query("tags")
        .withIndex("by_name", (q) => q.eq("name", tag.name))
        .first();

      let tagId;
      if (existing) {
        tagId = existing._id;
      } else {
        tagId = await ctx.db.insert("tags", {
          name: tag.name,
          typ: tag.typ,
          color: tag.color,
        });
      }
      tagIdMap.set(tag.id || tag.name, tagId);
      results.tags.push(tagId);
    }

    // 2. Migrate users
    const userIdMap = new Map<string, any>();
    for (const user of args.users) {
      const existing = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", user.email))
        .first();

      let userId;
      if (existing) {
        userId = existing._id;
      } else {
        userId = await ctx.db.insert("users", {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin).getTime() : undefined,
          totalVisits: user.totalVisits || 0,
        });
      }
      userIdMap.set(user.id || user.email, userId);
      results.users.push(userId);
    }

    // 3. Migrate navody
    const navodIdMap = new Map<string, any>();
    for (const navod of args.navody) {
      const existing = await ctx.db
        .query("navody")
        .withIndex("by_slug", (q) => q.eq("slug", navod.slug))
        .first();

      let navodId;
      if (existing) {
        // Update existing
        navodId = existing._id;
        await ctx.db.patch(navodId, {
          nazov: navod.nazov,
          videoUrl: navod.videoUrl,
          updatedAt: Date.now(),
          version: existing.version + 1,
        });
      } else {
        // Create new
        navodId = await ctx.db.insert("navody", {
          nazov: navod.nazov,
          slug: navod.slug,
          videoUrl: navod.videoUrl,
          createdAt: navod.vytvorene ? new Date(navod.vytvorene).getTime() : Date.now(),
          updatedAt: Date.now(),
          version: 1,
        });
      }

      navodIdMap.set(navod.id || navod.slug, navodId);

      // Clear existing related data
      const [existingTypPrace, existingProdukt, existingNaradie, existingKroky, existingPozor, existingChyby, existingObrazky] = await Promise.all([
        ctx.db.query("navodTypPrace").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodProdukt").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodNaradie").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodKroky").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodPozor").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodChyby").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
        ctx.db.query("navodObrazky").withIndex("by_navod", (q) => q.eq("navodId", navodId)).collect(),
      ]);

      await Promise.all([
        ...existingTypPrace.map(tp => ctx.db.delete(tp._id)),
        ...existingProdukt.map(p => ctx.db.delete(p._id)),
        ...existingNaradie.map(n => ctx.db.delete(n._id)),
        ...existingKroky.map(k => ctx.db.delete(k._id)),
        ...existingPozor.map(p => ctx.db.delete(p._id)),
        ...existingChyby.map(ch => ctx.db.delete(ch._id)),
        ...existingObrazky.map(o => ctx.db.delete(o._id)),
      ]);

      // Link tags
      for (const tagName of navod.typPrace || []) {
        let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
        if (!tag) {
          const newTagId = await ctx.db.insert("tags", { name: tagName, typ: "typ-prace" });
          tag = await ctx.db.get(newTagId);
        }
        if (tag) {
          await ctx.db.insert("navodTypPrace", { navodId, tagId: tag._id });
        }
      }

      for (const tagName of navod.produkt || []) {
        let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
        if (!tag) {
          const newTagId = await ctx.db.insert("tags", { name: tagName, typ: "produkt" });
          tag = await ctx.db.get(newTagId);
        }
        if (tag) {
          await ctx.db.insert("navodProdukt", { navodId, tagId: tag._id });
        }
      }

      // Insert naradie
      for (let i = 0; i < (navod.potrebneNaradie || []).length; i++) {
        await ctx.db.insert("navodNaradie", {
          navodId,
          order: i,
          popis: navod.potrebneNaradie[i].popis || navod.potrebneNaradie[i],
        });
      }

      // Insert kroky
      for (const krok of navod.postupPrace || []) {
        await ctx.db.insert("navodKroky", {
          navodId,
          cislo: krok.cislo,
          popis: krok.popis,
        });
      }

      // Insert pozor
      for (let i = 0; i < (navod.naCoSiDatPozor || []).length; i++) {
        await ctx.db.insert("navodPozor", {
          navodId,
          order: i,
          popis: navod.naCoSiDatPozor[i].popis || navod.naCoSiDatPozor[i],
        });
      }

      // Insert chyby
      for (let i = 0; i < (navod.casteChyby || []).length; i++) {
        await ctx.db.insert("navodChyby", {
          navodId,
          order: i,
          popis: navod.casteChyby[i].popis || navod.casteChyby[i],
        });
      }

      // Insert obrazky
      for (const obrazok of navod.obrazky || []) {
        await ctx.db.insert("navodObrazky", {
          navodId,
          url: obrazok.url,
          cisloKroku: obrazok.cisloKroku,
          popis: obrazok.popis || "",
        });
      }

      results.navody.push(navodId);
    }

    // 4. Migrate feedback
    for (const item of args.feedback) {
      const navodId = navodIdMap.get(item.navodId);
      const userId = userIdMap.get(item.userId);

      if (navodId && userId) {
        const feedbackId = await ctx.db.insert("pripomienky", {
          navodId,
          userId,
          sprava: item.sprava,
          cisloKroku: item.cisloKroku,
          stav: item.stav,
          createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt).getTime() : undefined,
        });
        results.feedback.push(feedbackId);
      }
    }

    return results;
  },
});
