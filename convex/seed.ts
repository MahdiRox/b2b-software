import { mutation } from "./_generated/server";

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    for (const doc of orders) await ctx.db.delete(doc._id);

    const products = await ctx.db.query("products").collect();
    for (const doc of products) await ctx.db.delete(doc._id);

    const categories = await ctx.db.query("categories").collect();
    for (const doc of categories) await ctx.db.delete(doc._id);

    return "All data cleared.";
  }
});

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return "Database already seeded.";
    }

    // Seed Categories
    const catStaples = await ctx.db.insert("categories", {
      name: "Céréales & Féculents",
      slug: "cereales-feculents",
      description: "Couscous, pâtes alimentaires, semoules et farines de blé",
    });
    
    const catOils = await ctx.db.insert("categories", {
      name: "Huiles & Corps Gras",
      slug: "huiles-corps-gras",
      description: "Huiles de table végétales raffinées et margarines",
    });

    const catBeverages = await ctx.db.insert("categories", {
      name: "Boissons & Eaux",
      slug: "boissons-eaux",
      description: "Sodas traditionnels, jus et eaux minérales gazeuses",
    });

    const catDairyGrocery = await ctx.db.insert("categories", {
      name: "Épicerie Sucrée & Laiterie",
      slug: "epicerie-sucree-laiterie",
      description: "Sucre raffiné, lait en poudre et dérivés sucrés",
    });

    // Seed Products
    const p1 = await ctx.db.insert("products", {
      name: "Couscous Fin Amor Benamor",
      sku: "ABN-COUS-1KG",
      categoryId: catStaples,
      pricePerUnit: 140,
      minOrderQuantity: 50,
      stockQuantity: 650,
      packageSize: "Colis de 24 x 1kg",
    });

    const p2 = await ctx.db.insert("products", {
      name: "Huile de Table Cevital Elio 5L",
      sku: "CEV-ELIO-5L",
      categoryId: catOils,
      pricePerUnit: 650,
      minOrderQuantity: 20,
      stockQuantity: 240,
      packageSize: "Carton de 4 x 5L",
    });

    const p3 = await ctx.db.insert("products", {
      name: "Sucre Blanc Cristallisé Cevital 1kg",
      sku: "CEV-SUC-1KG",
      categoryId: catDairyGrocery,
      pricePerUnit: 95,
      minOrderQuantity: 100,
      stockQuantity: 1400,
      packageSize: "Fardeau de 10 x 1kg",
    });

    const p4 = await ctx.db.insert("products", {
      name: "Hamoud Boualem Selecto 1L Verre",
      sku: "HMD-SEL-1L",
      categoryId: catBeverages,
      pricePerUnit: 85,
      minOrderQuantity: 40,
      stockQuantity: 520,
      packageSize: "Caisse de 12 x 1L",
    });

    const p5 = await ctx.db.insert("products", {
      name: "Pâtes Spaghettis Safina N°5",
      sku: "SAF-SPAG-500G",
      categoryId: catStaples,
      pricePerUnit: 70,
      minOrderQuantity: 60,
      stockQuantity: 80, // Low stock demo!
      packageSize: "Colis de 20 x 500g",
    });

    const p6 = await ctx.db.insert("products", {
      name: "Eau Minérale Naturelle Ifri 1.5L",
      sku: "IFR-EAU-15L",
      categoryId: catBeverages,
      pricePerUnit: 40,
      minOrderQuantity: 120,
      stockQuantity: 1800,
      packageSize: "Pack de 6 x 1.5L",
    });

    const p7 = await ctx.db.insert("products", {
      name: "Margarine Fleurial Cevital 500g",
      sku: "CEV-FLEUR-500G",
      categoryId: catOils,
      pricePerUnit: 210,
      minOrderQuantity: 30,
      stockQuantity: 45, // Low stock demo!
      packageSize: "Carton de 24 x 500g",
    });

    // Seed Orders
    await ctx.db.insert("orders", {
      clientName: "Superette El Baraka",
      clientPhone: "0550 12 34 56",
      wilaya: "Oran (31)",
      status: "Pending",
      totalAmountDA: 40000,
      items: [
        { productId: p1, quantity: 100, unitPriceDA: 140 },
        { productId: p2, quantity: 40, unitPriceDA: 650 },
      ],
      notes: "Livraison quai n°2, règlement à la décharge par chèque barré.",
      createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    });

    await ctx.db.insert("orders", {
      clientName: "Grossiste Ets Benbadis",
      clientPhone: "0661 98 76 54",
      wilaya: "Alger Centre (16)",
      status: "Validated",
      totalAmountDA: 114000,
      items: [
        { productId: p3, quantity: 1200, unitPriceDA: 95 },
      ],
      notes: "Enlèvement par camion semi-remorque client prévu à 14h00.",
      createdAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
    });

    await ctx.db.insert("orders", {
      clientName: "Alimentation Générale Ali",
      clientPhone: "0770 45 67 89",
      wilaya: "Constantine (25)",
      status: "In Delivery",
      totalAmountDA: 27900,
      items: [
        { productId: p1, quantity: 50, unitPriceDA: 140 },
        { productId: p4, quantity: 120, unitPriceDA: 85 },
        { productId: p5, quantity: 150, unitPriceDA: 70 },
      ],
      notes: "Chauffeur Kamel (Camion Isuzu 3.5T, matricule 04512-116-16).",
      createdAt: Date.now() - 1000 * 60 * 600, // 10 hours ago
    });

    await ctx.db.insert("orders", {
      clientName: "Centrale d'Achat Sétifienne",
      clientPhone: "0560 33 22 11",
      wilaya: "Sétif (19)",
      status: "Paid",
      totalAmountDA: 184500,
      items: [
        { productId: p2, quantity: 150, unitPriceDA: 650 },
        { productId: p6, quantity: 1200, unitPriceDA: 40 },
        { productId: p7, quantity: 185, unitPriceDA: 210 },
      ],
      notes: "Facture N° 2026-W094 soldée par virement BNA Algiers.",
      createdAt: Date.now() - 1000 * 60 * 1440, // 1 day ago
    });

    return "Database seeded successfully!";
  }
});
