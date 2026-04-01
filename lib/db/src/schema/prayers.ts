import { pgTable, text, serial, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const prayerLogsTable = pgTable("prayer_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  fajr: boolean("fajr").notNull().default(false),
  dhuhr: boolean("dhuhr").notNull().default(false),
  asr: boolean("asr").notNull().default(false),
  maghrib: boolean("maghrib").notNull().default(false),
  isha: boolean("isha").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  unique("prayer_logs_user_date").on(table.userId, table.date),
]);

export const insertPrayerLogSchema = createInsertSchema(prayerLogsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPrayerLog = z.infer<typeof insertPrayerLogSchema>;
export type PrayerLog = typeof prayerLogsTable.$inferSelect;
