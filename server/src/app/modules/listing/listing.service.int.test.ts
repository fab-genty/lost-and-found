import { describe, it, expect, beforeAll, afterAll } from "vitest";

const run = process.env.DATABASE_URL ? describe : describe.skip;

run("listingService (intégration)", () => {
  // Imports différés : éviter d'instancier PrismaClient quand la suite est skip
  let prisma: typeof import("../../config/prisma").default;
  let listingService: typeof import("./listing.service").listingService;
  let userId: string;
  let createdId: string;

  beforeAll(async () => {
    prisma = (await import("../../config/prisma")).default;
    listingService = (await import("./listing.service")).listingService;
    const u = await prisma.user.create({
      data: {
        username: `it_${Date.now()}`,
        email: `it_${Date.now()}@x.io`,
        password: "x",
      },
    });
    userId = u.id;
  });

  afterAll(async () => {
    if (createdId) await prisma.listing.deleteMany({ where: { id: createdId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("crée et relit un listing OBJECT", async () => {
    const created = await listingService.createListing(
      {
        type: "OBJECT",
        direction: "LOST",
        title: "Sac test",
        country: "Sénégal",
        contactPhone: "+221770000000",
      },
      userId
    );
    createdId = created.id;
    expect(created.type).toBe("OBJECT");
    const fetched = await listingService.getListing(created.id);
    expect(fetched?.title).toBe("Sac test");
  });

  it("filtre par type", async () => {
    const list = await listingService.getListings({ type: "OBJECT" });
    expect(list.every((l) => l.type === "OBJECT")).toBe(true);
  });
});
