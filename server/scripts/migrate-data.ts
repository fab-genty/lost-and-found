import prisma from "../src/app/config/prisma";

/**
 * Migre les données legacy (foundItems/lostItems/claims/itemsCategories)
 * vers le modèle unifié (listings/responses/categories).
 * Idempotent best-effort : à lancer une seule fois sur une base legacy.
 *
 * Les anciens modèles n'existent plus dans le client Prisma : lecture via SQL
 * brut sur les anciennes tables, insertion via le client.
 */
async function main() {
  // 1. Catégories
  const oldCategories = await prisma
    .$queryRawUnsafe<any[]>(
      `SELECT id, name, "createdAt", "updatedAt" FROM "itemsCategories"`
    )
    .catch(() => []);
  for (const c of oldCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  // 2. FoundItems -> Listing OBJECT/FOUND
  const found = await prisma
    .$queryRawUnsafe<any[]>(`SELECT * FROM "foundItems" WHERE "isDeleted" = false`)
    .catch(() => []);
  for (const f of found) {
    await prisma.listing.create({
      data: {
        id: f.id,
        type: "OBJECT",
        direction: "FOUND",
        title: f.foundItemName,
        description: f.description ?? "",
        country: "",
        city: f.location ?? "",
        photoUrl: f.img ?? "",
        contactPhone: "",
        categoryId: f.categoryId ?? null,
        date: f.date ?? new Date(),
        userId: f.userId,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      },
    });
  }

  // 3. LostItems -> Listing OBJECT/LOST
  const lost = await prisma
    .$queryRawUnsafe<any[]>(`SELECT * FROM "lostItems" WHERE "isDeleted" = false`)
    .catch(() => []);
  for (const l of lost) {
    await prisma.listing.create({
      data: {
        id: l.id,
        type: "OBJECT",
        direction: "LOST",
        title: l.lostItemName,
        description: l.description ?? "",
        country: "",
        city: l.location ?? "",
        photoUrl: l.img ?? "",
        contactPhone: "",
        categoryId: l.categoryId ?? null,
        date: l.date ?? new Date(),
        isResolved: l.isFound ?? false,
        userId: l.userId,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      },
    });
  }

  // 4. Claims -> Response CLAIM
  const claims = await prisma
    .$queryRawUnsafe<any[]>(`SELECT * FROM "claims" WHERE "isDeleted" = false`)
    .catch(() => []);
  for (const c of claims) {
    await prisma.response.create({
      data: {
        id: c.id,
        listingId: c.foundItemId,
        authorId: c.userId,
        kind: "CLAIM",
        message: c.distinguishingFeatures ?? "Revendication migrée",
        distinguishingFeatures: c.distinguishingFeatures ?? null,
        status: c.status ?? "PENDING",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    });
  }

  console.log(
    `Migration OK: ${oldCategories.length} catégories, ${found.length} trouvés, ${lost.length} perdus, ${claims.length} réclamations`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
