import { Router } from "express";
import { db, toolsTable, locationsTable } from "@workspace/db";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { CreateToolBody, UpdateToolBody, ListToolsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/tools", async (req, res) => {
  try {
    const parsed = ListToolsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        description: toolsTable.description,
        category: toolsTable.category,
        condition: toolsTable.condition,
        locationId: toolsTable.locationId,
        locationName: locationsTable.name,
        latitude: toolsTable.latitude,
        longitude: toolsTable.longitude,
        createdAt: toolsTable.createdAt,
        updatedAt: toolsTable.updatedAt,
      })
      .from(toolsTable)
      .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id))
      .$dynamic();

    const conditions = [];
    if (params.locationId) {
      conditions.push(eq(toolsTable.locationId, params.locationId));
    }
    if (params.search) {
      conditions.push(ilike(toolsTable.name, `%${params.search}%`));
    }

    if (conditions.length > 0) {
      // drizzle dynamic query
      const base = db
        .select({
          id: toolsTable.id,
          name: toolsTable.name,
          description: toolsTable.description,
          category: toolsTable.category,
          condition: toolsTable.condition,
          locationId: toolsTable.locationId,
          locationName: locationsTable.name,
          latitude: toolsTable.latitude,
          longitude: toolsTable.longitude,
          createdAt: toolsTable.createdAt,
          updatedAt: toolsTable.updatedAt,
        })
        .from(toolsTable)
        .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id));

      if (params.locationId && params.search) {
        const tools = await base
          .where(eq(toolsTable.locationId, params.locationId))
          .orderBy(desc(toolsTable.createdAt));
        const filtered = tools.filter(t => t.name.toLowerCase().includes(params.search!.toLowerCase()));
        res.json(filtered);
        return;
      } else if (params.locationId) {
        const tools = await base
          .where(eq(toolsTable.locationId, params.locationId))
          .orderBy(desc(toolsTable.createdAt));
        res.json(tools);
        return;
      } else if (params.search) {
        const tools = await base
          .where(ilike(toolsTable.name, `%${params.search}%`))
          .orderBy(desc(toolsTable.createdAt));
        res.json(tools);
        return;
      }
    }

    const tools = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        description: toolsTable.description,
        category: toolsTable.category,
        condition: toolsTable.condition,
        locationId: toolsTable.locationId,
        locationName: locationsTable.name,
        latitude: toolsTable.latitude,
        longitude: toolsTable.longitude,
        createdAt: toolsTable.createdAt,
        updatedAt: toolsTable.updatedAt,
      })
      .from(toolsTable)
      .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id))
      .orderBy(desc(toolsTable.createdAt));

    res.json(tools);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tools", async (req, res) => {
  try {
    const parsed = CreateToolBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [tool] = await db.insert(toolsTable).values({
      ...parsed.data,
      updatedAt: new Date(),
    }).returning();
    const withLocation = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        description: toolsTable.description,
        category: toolsTable.category,
        condition: toolsTable.condition,
        locationId: toolsTable.locationId,
        locationName: locationsTable.name,
        latitude: toolsTable.latitude,
        longitude: toolsTable.longitude,
        createdAt: toolsTable.createdAt,
        updatedAt: toolsTable.updatedAt,
      })
      .from(toolsTable)
      .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id))
      .where(eq(toolsTable.id, tool.id))
      .limit(1);
    res.status(201).json(withLocation[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tools/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const [tool] = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        description: toolsTable.description,
        category: toolsTable.category,
        condition: toolsTable.condition,
        locationId: toolsTable.locationId,
        locationName: locationsTable.name,
        latitude: toolsTable.latitude,
        longitude: toolsTable.longitude,
        createdAt: toolsTable.createdAt,
        updatedAt: toolsTable.updatedAt,
      })
      .from(toolsTable)
      .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id))
      .where(eq(toolsTable.id, id))
      .limit(1);
    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    res.json(tool);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/tools/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const parsed = UpdateToolBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const existing = await db.select().from(toolsTable).where(eq(toolsTable.id, id)).limit(1);
    if (!existing[0]) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    await db.update(toolsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(toolsTable.id, id));
    const [updated] = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        description: toolsTable.description,
        category: toolsTable.category,
        condition: toolsTable.condition,
        locationId: toolsTable.locationId,
        locationName: locationsTable.name,
        latitude: toolsTable.latitude,
        longitude: toolsTable.longitude,
        createdAt: toolsTable.createdAt,
        updatedAt: toolsTable.updatedAt,
      })
      .from(toolsTable)
      .leftJoin(locationsTable, eq(toolsTable.locationId, locationsTable.id))
      .where(eq(toolsTable.id, id))
      .limit(1);
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tools/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const existing = await db.select().from(toolsTable).where(eq(toolsTable.id, id)).limit(1);
    if (!existing[0]) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }
    await db.delete(toolsTable).where(eq(toolsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
