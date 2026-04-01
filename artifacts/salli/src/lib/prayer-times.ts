import { format, parse, isAfter, addDays, startOfDay, differenceInSeconds } from 'date-fns';

export const PRAYER_SCHEDULE = {
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:20',
  isha: '20:00',
};

export const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export type PrayerName = typeof PRAYER_NAMES[number];

export function getPrayerDisplayName(prayer: PrayerName): string {
  return prayer.charAt(0).toUpperCase() + prayer.slice(1);
}

export function getNextPrayer(now: Date = new Date()) {
  const today = startOfDay(now);
  
  for (const prayer of PRAYER_NAMES) {
    const timeStr = PRAYER_SCHEDULE[prayer];
    const prayerTime = parse(timeStr, 'HH:mm', today);
    
    if (isAfter(prayerTime, now)) {
      return {
        prayer,
        time: prayerTime,
        isTomorrow: false
      };
    }
  }
  
  // If all prayers today have passed, the next prayer is Fajr tomorrow
  const tomorrow = addDays(today, 1);
  return {
    prayer: 'fajr' as PrayerName,
    time: parse(PRAYER_SCHEDULE.fajr, 'HH:mm', tomorrow),
    isTomorrow: true
  };
}

export function getPrayerCountdown(now: Date = new Date()) {
  const next = getNextPrayer(now);
  const diffSeconds = differenceInSeconds(next.time, now);
  
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  
  return {
    ...next,
    hours,
    minutes,
    seconds,
    totalSeconds: diffSeconds,
    // Just an arbitrary max for the ring, say 4 hours
    percentage: Math.min(100, Math.max(0, 100 - (diffSeconds / (4 * 3600)) * 100))
  };
}
