import { Router, type IRouter } from "express";
import { db, prayerLogsTable, usersTable } from "@workspace/db";
import { format, startOfWeek, endOfWeek, subDays } from "date-fns";

const router: IRouter = Router();

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

function countCompleted(row: { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean }) {
  return PRAYERS.filter((p) => row[p]).length;
}

router.get("/leaderboard", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const currentUserId = req.user.id;
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const users = await db.select().from(usersTable);
  const allLogs = await db.select().from(prayerLogsTable);

  const entries = users.map((user) => {
    const userLogs = allLogs.filter((l) => l.userId === user.id);
    const weekLogs = userLogs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
    const weeklyTotal = weekLogs.reduce((sum, l) => sum + countCompleted(l), 0);
    const weeklyPercentage = Math.round((weeklyTotal / 35) * 100);

    // Current streak
    const logMap = new Map(userLogs.map((l) => [l.date, l]));
    let streak = 0;
    let checkDate = format(now, "yyyy-MM-dd");
    while (true) {
      const log = logMap.get(checkDate);
      if (log && countCompleted(log) === 5) {
        streak++;
        checkDate = format(subDays(new Date(checkDate + "T12:00:00"), 1), "yyyy-MM-dd");
      } else {
        break;
      }
    }

    return {
      userId: user.id,
      displayName: user.displayName,
      city: user.city ?? null,
      weeklyTotal,
      weeklyPercentage,
      currentStreak: streak,
      isCurrentUser: user.id === currentUserId,
    };
  });

  // Sort: weekly % desc, then streak desc, then name asc
  entries.sort((a, b) => {
    if (b.weeklyPercentage !== a.weeklyPercentage) return b.weeklyPercentage - a.weeklyPercentage;
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    return a.displayName.localeCompare(b.displayName);
  });

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));

  res.json(ranked);
});

export default router;
