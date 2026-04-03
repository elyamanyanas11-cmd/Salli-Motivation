import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { differenceInSeconds, addMinutes, addDays, startOfDay } from 'date-fns';

export const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = typeof PRAYER_NAMES[number];

export const IQAMA_OFFSET_MINUTES: Record<PrayerName, number> = {
  fajr: 20,
  dhuhr: 15,
  asr: 15,
  maghrib: 5,
  isha: 15,
};

export const PRAYER_SCHEDULE = {
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:20',
  isha: '20:00',
};

export function getPrayerDisplayName(prayer: PrayerName): string {
  return prayer.charAt(0).toUpperCase() + prayer.slice(1);
}

export function calculatePrayerTimes(lat: number, lng: number, date: Date = new Date()): Record<PrayerName, Date> {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.MuslimWorldLeague();
  const times = new PrayerTimes(coordinates, date, params);
  return {
    fajr: times.fajr,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export function getIqamaTimes(prayerTimes: Record<PrayerName, Date>): Record<PrayerName, Date> {
  const result = {} as Record<PrayerName, Date>;
  for (const prayer of PRAYER_NAMES) {
    result[prayer] = addMinutes(prayerTimes[prayer], IQAMA_OFFSET_MINUTES[prayer]);
  }
  return result;
}

export function getNextPrayerFromTimes(
  prayerTimes: Record<PrayerName, Date>,
  now: Date = new Date()
): { prayer: PrayerName; time: Date; isTomorrow: boolean } {
  for (const prayer of PRAYER_NAMES) {
    if (prayerTimes[prayer] > now) {
      return { prayer, time: prayerTimes[prayer], isTomorrow: false };
    }
  }
  const tomorrow = addDays(startOfDay(now), 1);
  const tomorrowTimes = calculatePrayerTimes(0, 0, tomorrow);
  return { prayer: 'fajr', time: tomorrowTimes.fajr, isTomorrow: true };
}

export function getPrayerCountdown(now: Date = new Date()) {
  const today = startOfDay(now);
  const fallback: Record<PrayerName, Date> = {
    fajr: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 0),
    dhuhr: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
    asr: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 45),
    maghrib: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 20),
    isha: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0),
  };
  const next = getNextPrayerFromTimes(fallback, now);
  const diffSeconds = Math.max(0, differenceInSeconds(next.time, now));
  return {
    ...next,
    hours: Math.floor(diffSeconds / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
    totalSeconds: diffSeconds,
    percentage: Math.min(100, Math.max(0, 100 - (diffSeconds / (4 * 3600)) * 100)),
  };
}

export function getQiblaDirection(lat: number, lng: number): number {
  return Qibla(new Coordinates(lat, lng));
}
