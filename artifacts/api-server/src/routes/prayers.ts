import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, prayerLogsTable } from "@workspace/db";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays } from "date-fns";

const router: IRouter = Router();

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
const PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function countCompleted(row: { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean }) {
  return PRAYERS.filter((p) => row[p]).length;
}

async function getOrCreateDay(userId: number, date: string) {
  const [existing] = await db
    .select()
    .from(prayerLogsTable)
    .where(and(eq(prayerLogsTable.userId, userId), eq(prayerLogsTable.date, date)));
  if (existing) return existing;
  const [created] = await db
    .insert(prayerLogsTable)
    .values({ userId, date })
    .returning();
  return created;
}

function toPrayerDay(row: { date: string; fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean }) {
  return {
    date: row.date,
    fajr: row.fajr,
    dhuhr: row.dhuhr,
    asr: row.asr,
    maghrib: row.maghrib,
    isha: row.isha,
    completedCount: countCompleted(row),
  };
}

// GET /api/prayers/stats — must be before /:date to avoid param match
router.get("/prayers/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const userId = req.user.id;

  // Total prayers ever
  const allLogs = await db
    .select()
    .from(prayerLogsTable)
    .where(eq(prayerLogsTable.userId, userId))
    .orderBy(desc(prayerLogsTable.date));

  let totalPrayers = 0;
  for (const log of allLogs) {
    totalPrayers += countCompleted(log);
  }

  // Current streak — count consecutive days with all 5 prayers done from today backwards
  let streak = 0;
  const today = format(new Date(), "yyyy-MM-dd");
  let checkDate = today;

  const logMap = new Map(allLogs.map((l) => [l.date, l]));

  while (true) {
    const log = logMap.get(checkDate);
    if (log && countCompleted(log) === 5) {
      streak++;
      checkDate = format(subDays(new Date(checkDate + "T12:00:00"), 1), "yyyy-MM-dd");
    } else {
      break;
    }
  }

  // Weekly stats
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekLogs = allLogs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
  const weeklyTotal = weekLogs.reduce((sum, l) => sum + countCompleted(l), 0);
  const weeklyPercentage = Math.round((weeklyTotal / 35) * 100);

  res.json({ currentStreak: streak, totalPrayers, weeklyTotal, weeklyPercentage });
});

// GET /api/prayers/week
router.get("/prayers/week", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const userId = req.user.id;

  const now = new Date();
  const weekDays = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  });

  const dateStrings = weekDays.map((d) => format(d, "yyyy-MM-dd"));

  const logs = await db
    .select()
    .from(prayerLogsTable)
    .where(eq(prayerLogsTable.userId, userId));

  const logMap = new Map(logs.map((l) => [l.date, l]));

  const days = weekDays.map((d, i) => {
    const dateStr = dateStrings[i];
    const log = logMap.get(dateStr);
    return {
      date: dateStr,
      dayName: format(d, "EEE"),
      fajr: log?.fajr ?? false,
      dhuhr: log?.dhuhr ?? false,
      asr: log?.asr ?? false,
      maghrib: log?.maghrib ?? false,
      isha: log?.isha ?? false,
      completedCount: log ? countCompleted(log) : 0,
      isToday: isToday(d),
    };
  });

  const weeklyTotal = days.reduce((s, d) => s + d.completedCount, 0);
  const weeklyPercentage = Math.round((weeklyTotal / 35) * 100);

  res.json({ days, weeklyTotal, weeklyPercentage });
});

// GET /api/prayers/:date
router.get("/prayers/:date", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const row = await getOrCreateDay(req.user.id, date);
  res.json(toPrayerDay(row));
});

// POST /api/prayers/:date/:prayer
router.post("/prayers/:date/:prayer", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const prayer = Array.isArray(req.params.prayer) ? req.params.prayer[0] : req.params.prayer;

  if (!PRAYERS.includes(prayer as PrayerName)) {
    res.status(400).json({ error: "Invalid prayer name" });
    return;
  }

  await getOrCreateDay(req.user.id, date);

  const [updated] = await db
    .update(prayerLogsTable)
    .set({ [prayer]: true })
    .where(and(eq(prayerLogsTable.userId, req.user.id), eq(prayerLogsTable.date, date)))
    .returning();

  res.json(toPrayerDay(updated));
});

// DELETE /api/prayers/:date/:prayer
router.delete("/prayers/:date/:prayer", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;
  const prayer = Array.isArray(req.params.prayer) ? req.params.prayer[0] : req.params.prayer;

  if (!PRAYERS.includes(prayer as PrayerName)) {
    res.status(400).json({ error: "Invalid prayer name" });
    return;
  }

  await getOrCreateDay(req.user.id, date);

  const [updated] = await db
    .update(prayerLogsTable)
    .set({ [prayer]: false })
    .where(and(eq(prayerLogsTable.userId, req.user.id), eq(prayerLogsTable.date, date)))
    .returning();

  res.json(toPrayerDay(updated));
});

export default router;
