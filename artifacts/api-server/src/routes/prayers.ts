import { Router, type IRouter } from "express";
import { eq, and, desc, or, sql, gte } from "drizzle-orm";
import { db, prayerLogsTable, prayerActivityTable, usersTable, friendships } from "@workspace/db";
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

async function computeStreak(userId: number): Promise<number> {
  const allLogs = await db
    .select()
    .from(prayerLogsTable)
    .where(eq(prayerLogsTable.userId, userId))
    .orderBy(desc(prayerLogsTable.date));
  const logMap = new Map(allLogs.map((l) => [l.date, l]));
  let streak = 0;
  let checkDate = format(new Date(), "yyyy-MM-dd");
  while (true) {
    const log = logMap.get(checkDate);
    if (log && countCompleted(log) === 5) {
      streak++;
      checkDate = format(subDays(new Date(checkDate + "T12:00:00"), 1), "yyyy-MM-dd");
    } else {
      break;
    }
  }
  return streak;
}

async function getFriendIds(myId: number): Promise<number[]> {
  const rows = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(eq(friendships.requesterId, myId), eq(friendships.addresseeId, myId)),
        eq(friendships.status, "accepted")
      )
    );
  return rows.map((r) => (r.requesterId === myId ? r.addresseeId : r.requesterId));
}

// GET /api/prayers/stats — must be before /:date to avoid param match
router.get("/prayers/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const userId = req.user.id;

  const allLogs = await db
    .select()
    .from(prayerLogsTable)
    .where(eq(prayerLogsTable.userId, userId))
    .orderBy(desc(prayerLogsTable.date));

  let totalPrayers = 0;
  for (const log of allLogs) {
    totalPrayers += countCompleted(log);
  }

  const logMap = new Map(allLogs.map((l) => [l.date, l]));
  let streak = 0;
  let checkDate = format(new Date(), "yyyy-MM-dd");
  while (true) {
    const log = logMap.get(checkDate);
    if (log && countCompleted(log) === 5) {
      streak++;
      checkDate = format(subDays(new Date(checkDate + "T12:00:00"), 1), "yyyy-MM-dd");
    } else {
      break;
    }
  }

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekLogs = allLogs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
  const weeklyTotal = weekLogs.reduce((sum, l) => sum + countCompleted(l), 0);
  const weeklyPercentage = Math.round((weeklyTotal / 35) * 100);

  res.json({ currentStreak: streak, totalPrayers, weeklyTotal, weeklyPercentage });
});

// GET /api/prayers/friends/streaks
router.get("/prayers/friends/streaks", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const myId = req.user.id;
  const friendIds = await getFriendIds(myId);

  if (friendIds.length === 0) {
    res.json([]);
    return;
  }

  const friendUsers = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${friendIds})`);

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const results = await Promise.all(
    friendUsers.map(async (u) => {
      const logs = await db
        .select()
        .from(prayerLogsTable)
        .where(eq(prayerLogsTable.userId, u.id))
        .orderBy(desc(prayerLogsTable.date));

      const logMap = new Map(logs.map((l) => [l.date, l]));

      let streak = 0;
      let checkDate = today;
      while (true) {
        const log = logMap.get(checkDate);
        if (log && countCompleted(log) === 5) {
          streak++;
          checkDate = format(subDays(new Date(checkDate + "T12:00:00"), 1), "yyyy-MM-dd");
        } else {
          break;
        }
      }

      const todayLog = logMap.get(today);
      const todayCompleted = todayLog ? countCompleted(todayLog) : 0;

      const weekLogs = logs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
      const weeklyTotal = weekLogs.reduce((sum, l) => sum + countCompleted(l), 0);
      const weeklyPercentage = Math.round((weeklyTotal / 35) * 100);

      return {
        userId: u.id,
        displayName: u.displayName,
        username: u.username ?? null,
        currentStreak: streak,
        todayCompleted,
        weeklyPercentage,
      };
    })
  );

  results.sort((a, b) => b.currentStreak - a.currentStreak || b.weeklyPercentage - a.weeklyPercentage);
  res.json(results);
});

// GET /api/prayers/friends/activity
router.get("/prayers/friends/activity", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const myId = req.user.id;
  const friendIds = await getFriendIds(myId);

  if (friendIds.length === 0) {
    res.json([]);
    return;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const activities = await db
    .select()
    .from(prayerActivityTable)
    .where(
      and(
        sql`${prayerActivityTable.userId} = ANY(${friendIds})`,
        gte(prayerActivityTable.createdAt, since)
      )
    )
    .orderBy(desc(prayerActivityTable.createdAt))
    .limit(50);

  if (activities.length === 0) {
    res.json([]);
    return;
  }

  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${userIds})`);
  const userMap = new Map(users.map((u) => [u.id, u]));

  res.json(
    activities.map((a) => {
      const u = userMap.get(a.userId);
      return {
        activityId: a.id,
        userId: a.userId,
        displayName: u?.displayName ?? "Unknown",
        username: u?.username ?? null,
        prayer: a.prayer,
        date: a.date,
        createdAt: a.createdAt.toISOString(),
      };
    })
  );
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

  // Log activity event so friends can see it
  await db.insert(prayerActivityTable).values({
    userId: req.user.id,
    date,
    prayer,
  });

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
