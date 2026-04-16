import { Router } from "express";
import { db, toolsTable, locationsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [totalToolsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(toolsTable);
    const [totalLocationsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(locationsTable);

    const conditionRows = await db
      .select({ condition: toolsTable.condition, count: sql<number>`count(*)::int` })
      .from(toolsTable)
      .groupBy(toolsTable.condition);
    const toolsByCondition: Record<string, number> = {};
    for (const row of conditionRows) {
      toolsByCondition[row.condition] = row.count;
    }

    const locationCounts = await db
      .select({ name: locationsTable.name, count: sql<number>`count(${toolsTable.id})::int` })
      .from(locationsTable)
      .leftJoin(toolsTable, eq(toolsTable.locationId, locationsTable.id))
      .groupBy(locationsTable.id, locationsTable.name)
      .orderBy(sql`count(${toolsTable.id}) desc`)
      .limit(1);
    const mostActiveLocation = locationCounts[0]?.name ?? null;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [recentResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolsTable)
      .where(sql`${toolsTable.createdAt} >= ${sevenDaysAgo}`);

    res.json({
      totalTools: totalToolsResult.count,
      totalLocations: totalLocationsResult.count,
      toolsByCondition,
      mostActiveLocation,
      recentlyAdded: recentResult.count,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/by-location", async (req, res) => {
  try {
    const rows = await db
      .select({
        locationId: locationsTable.id,
        locationName: locationsTable.name,
        toolCount: sql<number>`count(${toolsTable.id})::int`,
        latitude: locationsTable.latitude,
        longitude: locationsTable.longitude,
      })
      .from(locationsTable)
      .leftJoin(toolsTable, eq(toolsTable.locationId, locationsTable.id))
      .groupBy(locationsTable.id, locationsTable.name, locationsTable.latitude, locationsTable.longitude)
      .orderBy(sql`count(${toolsTable.id}) desc`);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent", async (req, res) => {
  try {
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
      .orderBy(desc(toolsTable.createdAt))
      .limit(10);
    res.json(tools);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
