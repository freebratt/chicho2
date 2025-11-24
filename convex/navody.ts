import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all navody with their relationships
export const getAllNavody = query({
  handler: async (ctx) => {
    const navody = await ctx.db.query("navody").order("desc").collect();
    
    const navodiesWithDetails = await Promise.all(
      navody.map(async (navod) => {
        const [typPrace, produkt, naradie, kroky, pozor, chyby, obrazky] = await Promise.all([
          ctx.db.query("navodTypPrace").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodProdukt").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodNaradie").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodKroky").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodPozor").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodChyby").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
          ctx.db.query("navodObrazky").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
        ]);

        const typPraceNames = await Promise.all(
          typPrace.map(async (tp) => {
            const tag = await ctx.db.get(tp.tagId);
            return tag?.name || "";
          })
        );
        
        const produktNames = await Promise.all(
          produkt.map(async (p) => {
            const tag = await ctx.db.get(p.tagId);
            return tag?.name || "";
          })
        );

        return {
          id: navod._id,
          nazov: navod.nazov,
          slug: navod.slug,
          typPrace: typPraceNames.filter(Boolean),
          produkt: produktNames.filter(Boolean),
          potrebneNaradie: naradie.sort((a, b) => a.order - b.order).map(n => ({ id: n._id, popis: n.popis })),
          postupPrace: kroky.sort((a, b) => a.cislo - b.cislo).map(k => ({ id: k._id, cislo: k.cislo, popis: k.popis })),
          naCoSiDatPozor: pozor.sort((a, b) => a.order - b.order).map(p => ({ id: p._id, popis: p.popis })),
          casteChyby: chyby.sort((a, b) => a.order - b.order).map(ch => ({ id: ch._id, popis: ch.popis })),
          obrazky: obrazky.map(o => ({ id: o._id, url: o.url, cisloKroku: o.cisloKroku, popis: o.popis })),
          videoUrl: navod.videoUrl,
          vytvorene: navod.createdAt,
          aktualizovane: navod.updatedAt,
        };
      })
    );

    return navodiesWithDetails;
  },
});

// Get single navod by slug
export const getNavodBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const navod = await ctx.db
      .query("navody")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!navod) return null;

    const [typPrace, produkt, naradie, kroky, pozor, chyby, obrazky, attachments] = await Promise.all([
      ctx.db.query("navodTypPrace").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodProdukt").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodNaradie").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodKroky").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodPozor").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodChyby").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodObrazky").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
      ctx.db.query("navodAttachments").withIndex("by_navod", (q) => q.eq("navodId", navod._id)).collect(),
    ]);

    const typPraceNames = await Promise.all(
      typPrace.map(async (tp) => {
        const tag = await ctx.db.get(tp.tagId);
        return tag?.name || "";
      })
    );
    
    const produktNames = await Promise.all(
      produkt.map(async (p) => {
        const tag = await ctx.db.get(p.tagId);
        return tag?.name || "";
      })
    );

    return {
      id: navod._id,
      nazov: navod.nazov,
      slug: navod.slug,
      typPrace: typPraceNames.filter(Boolean),
      produkt: produktNames.filter(Boolean),
      potrebneNaradie: naradie.sort((a, b) => a.order - b.order).map(n => ({ id: n._id, popis: n.popis })),
      postupPrace: kroky.sort((a, b) => a.cislo - b.cislo).map(k => ({ id: k._id, cislo: k.cislo, popis: k.popis })),
      naCoSiDatPozor: pozor.sort((a, b) => a.order - b.order).map(p => ({ id: p._id, popis: p.popis })),
      casteChyby: chyby.sort((a, b) => a.order - b.order).map(ch => ({ id: ch._id, popis: ch.popis })),
      obrazky: obrazky.map(o => ({ id: o._id, url: o.url, cisloKroku: o.cisloKroku, popis: o.popis })),
      attachments: attachments.map(a => ({ id: a._id, filename: a.filename })),
      videoUrl: navod.videoUrl,
      vytvorene: navod.createdAt,
      aktualizovane: navod.updatedAt,
      version: navod.version,
    };
  },
});

// Create new navod
export const createNavod = mutation({
  args: {
    nazov: v.string(),
    slug: v.string(),
    typPrace: v.array(v.string()),
    produkt: v.array(v.string()),
    potrebneNaradie: v.array(v.object({ popis: v.string() })),
    postupPrace: v.array(v.object({ cislo: v.number(), popis: v.string() })),
    naCoSiDatPozor: v.array(v.object({ popis: v.string() })),
    casteChyby: v.array(v.object({ popis: v.string() })),
    obrazky: v.optional(v.array(v.object({ url: v.string(), cisloKroku: v.number(), popis: v.string() }))),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create main navod
    const navodId = await ctx.db.insert("navody", {
      nazov: args.nazov,
      slug: args.slug,
      videoUrl: args.videoUrl,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    // Get or create tags and link them
    for (const tagName of args.typPrace) {
      let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
      if (!tag) {
        const tagId = await ctx.db.insert("tags", { name: tagName, typ: "typ-prace" });
        tag = await ctx.db.get(tagId);
      }
      if (tag) {
        await ctx.db.insert("navodTypPrace", { navodId, tagId: tag._id });
      }
    }

    for (const tagName of args.produkt) {
      let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
      if (!tag) {
        const tagId = await ctx.db.insert("tags", { name: tagName, typ: "produkt" });
        tag = await ctx.db.get(tagId);
      }
      if (tag) {
        await ctx.db.insert("navodProdukt", { navodId, tagId: tag._id });
      }
    }

    // Insert naradie
    for (let i = 0; i < args.potrebneNaradie.length; i++) {
      await ctx.db.insert("navodNaradie", {
        navodId,
        order: i,
        popis: args.potrebneNaradie[i].popis,
      });
    }

    // Insert kroky
    for (const krok of args.postupPrace) {
      await ctx.db.insert("navodKroky", {
        navodId,
        cislo: krok.cislo,
        popis: krok.popis,
      });
    }

    // Insert pozor
    for (let i = 0; i < args.naCoSiDatPozor.length; i++) {
      await ctx.db.insert("navodPozor", {
        navodId,
        order: i,
        popis: args.naCoSiDatPozor[i].popis,
      });
    }

    // Insert chyby
    for (let i = 0; i < args.casteChyby.length; i++) {
      await ctx.db.insert("navodChyby", {
        navodId,
        order: i,
        popis: args.casteChyby[i].popis,
      });
    }

    // Insert obrazky
    if (args.obrazky) {
      for (const obrazok of args.obrazky) {
        await ctx.db.insert("navodObrazky", {
          navodId,
          url: obrazok.url,
          cisloKroku: obrazok.cisloKroku,
          popis: obrazok.popis,
        });
      }
    }

    return navodId;
  },
});

// Delete navod
export const deleteNavod = mutation({
  args: { navodId: v.id("navody") },
  handler: async (ctx, args) => {
    // Delete all related data
    const [typPrace, produkt, naradie, kroky, pozor, chyby, obrazky] = await Promise.all([
      ctx.db.query("navodTypPrace").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodProdukt").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodNaradie").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodKroky").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodPozor").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodChyby").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodObrazky").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
    ]);

    await Promise.all([
      ...typPrace.map((tp) => ctx.db.delete(tp._id)),
      ...produkt.map((p) => ctx.db.delete(p._id)),
      ...naradie.map((n) => ctx.db.delete(n._id)),
      ...kroky.map((k) => ctx.db.delete(k._id)),
      ...pozor.map((p) => ctx.db.delete(p._id)),
      ...chyby.map((ch) => ctx.db.delete(ch._id)),
      ...obrazky.map((o) => ctx.db.delete(o._id)),
    ]);

    await ctx.db.delete(args.navodId);
  },
});

// Update navod
export const updateNavod = mutation({
  args: {
    navodId: v.id("navody"),
    nazov: v.string(),
    slug: v.string(),
    typPrace: v.array(v.string()),
    produkt: v.array(v.string()),
    potrebneNaradie: v.array(v.object({ popis: v.string() })),
    postupPrace: v.array(v.object({ cislo: v.number(), popis: v.string() })),
    naCoSiDatPozor: v.array(v.object({ popis: v.string() })),
    casteChyby: v.array(v.object({ popis: v.string() })),
    obrazky: v.optional(v.array(v.object({ url: v.string(), cisloKroku: v.number(), popis: v.string() }))),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update main navod
    const navod = await ctx.db.get(args.navodId);
    if (!navod) throw new Error("Navod not found");
    
    await ctx.db.patch(args.navodId, {
      nazov: args.nazov,
      slug: args.slug,
      videoUrl: args.videoUrl,
      updatedAt: now,
      version: navod.version + 1,
    });

    // Delete all existing relationships and items
    const [typPrace, produkt, naradie, kroky, pozor, chyby, obrazky] = await Promise.all([
      ctx.db.query("navodTypPrace").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodProdukt").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodNaradie").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodKroky").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodPozor").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodChyby").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
      ctx.db.query("navodObrazky").withIndex("by_navod", (q) => q.eq("navodId", args.navodId)).collect(),
    ]);

    await Promise.all([
      ...typPrace.map((tp) => ctx.db.delete(tp._id)),
      ...produkt.map((p) => ctx.db.delete(p._id)),
      ...naradie.map((n) => ctx.db.delete(n._id)),
      ...kroky.map((k) => ctx.db.delete(k._id)),
      ...pozor.map((p) => ctx.db.delete(p._id)),
      ...chyby.map((ch) => ctx.db.delete(ch._id)),
      ...obrazky.map((o) => ctx.db.delete(o._id)),
    ]);

    // Re-create all relationships with new data
    for (const tagName of args.typPrace) {
      let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
      if (!tag) {
        const tagId = await ctx.db.insert("tags", { name: tagName, typ: "typ-prace" });
        tag = await ctx.db.get(tagId);
      }
      if (tag) {
        await ctx.db.insert("navodTypPrace", { navodId: args.navodId, tagId: tag._id });
      }
    }

    for (const tagName of args.produkt) {
      let tag = await ctx.db.query("tags").withIndex("by_name", (q) => q.eq("name", tagName)).first();
      if (!tag) {
        const tagId = await ctx.db.insert("tags", { name: tagName, typ: "produkt" });
        tag = await ctx.db.get(tagId);
      }
      if (tag) {
        await ctx.db.insert("navodProdukt", { navodId: args.navodId, tagId: tag._id });
      }
    }

    for (let i = 0; i < args.potrebneNaradie.length; i++) {
      await ctx.db.insert("navodNaradie", {
        navodId: args.navodId,
        order: i,
        popis: args.potrebneNaradie[i].popis,
      });
    }

    for (const krok of args.postupPrace) {
      await ctx.db.insert("navodKroky", {
        navodId: args.navodId,
        cislo: krok.cislo,
        popis: krok.popis,
      });
    }

    for (let i = 0; i < args.naCoSiDatPozor.length; i++) {
      await ctx.db.insert("navodPozor", {
        navodId: args.navodId,
        order: i,
        popis: args.naCoSiDatPozor[i].popis,
      });
    }

    for (let i = 0; i < args.casteChyby.length; i++) {
      await ctx.db.insert("navodChyby", {
        navodId: args.navodId,
        order: i,
        popis: args.casteChyby[i].popis,
      });
    }

    if (args.obrazky) {
      for (const obrazok of args.obrazky) {
        await ctx.db.insert("navodObrazky", {
          navodId: args.navodId,
          url: obrazok.url,
          cisloKroku: obrazok.cisloKroku,
          popis: obrazok.popis,
        });
      }
    }

    return args.navodId;
  },
});

// Get all visits with statistics
export const getAllVisitsWithStats = query({
  handler: async (ctx) => {
    const navstevy = await ctx.db.query("navodNavstevy").order("desc").collect();
    const navody = await ctx.db.query("navody").collect();
    
    const visitsByNavod: { [navodId: string]: any[] } = {};
    navstevy.forEach(navsteva => {
      const navodIdStr = navsteva.navodId.toString();
      if (!visitsByNavod[navodIdStr]) {
        visitsByNavod[navodIdStr] = [];
      }
      visitsByNavod[navodIdStr].push({
        id: navsteva._id,
        navodId: navsteva.navodId,
        uzivatelId: navsteva.userId,
        cas: navsteva.timestamp,
        uzivatelMeno: navsteva.userName,
        uzivatelEmail: navsteva.userEmail,
        navodNazov: navsteva.navodNazov
      });
    });
    
    return navody.map(navod => ({
      navod: {
        id: navod._id,
        nazov: navod.nazov,
        slug: navod.slug
      },
      navstevy: visitsByNavod[navod._id.toString()] || [],
      pocetNavstev: visitsByNavod[navod._id.toString()]?.length || 0,
      poslednaNavsteva: visitsByNavod[navod._id.toString()]?.[0]?.cas,
      unikatniUzivatelia: Array.from(new Set(visitsByNavod[navod._id.toString()]?.map((n: any) => n.uzivatelId.toString()) || [])).length
    }));
  },
});
