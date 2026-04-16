import { Router } from "express";
import { db, locationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateLocationBody } from "@workspace/api-zod";

const router = Router();

router.get("/locations", async (req, res) => {
  try {
    const locations = await db.select().from(locationsTable).orderBy(locationsTable.createdAt);
    res.json(locations);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/locations", async (req, res) => {
  try {
    const parsed = CreateLocationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [location] = await db.insert(locationsTable).values(parsed.data).returning();
    res.status(201).json(location);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/locations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    await db.delete(locationsTable).where(eq(locationsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
