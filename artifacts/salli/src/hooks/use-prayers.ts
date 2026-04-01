import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export type PrayerTimes = {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
};

export type DayRecord = PrayerTimes;
export type PrayerTrackerData = Record<string, DayRecord>;

const STORAGE_KEY = 'salli-prayers';

const defaultDay: DayRecord = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

export function usePrayers() {
  const [data, setData] = useState<PrayerTrackerData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const getDay = useCallback((date: Date | string) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return data[dateStr] || { ...defaultDay };
  }, [data]);

  const togglePrayer = useCallback((dateStr: string, prayer: keyof PrayerTimes) => {
    setData((prev) => {
      const dayData = prev[dateStr] || { ...defaultDay };
      return {
        ...prev,
        [dateStr]: {
          ...dayData,
          [prayer]: !dayData[prayer],
        },
      };
    });
  }, []);

  const getStreak = useCallback(() => {
    let streak = 0;
    let currentDate = new Date();
    // Start by checking today, if not complete, check yesterday
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const todayData = data[todayStr];
    const todayDone = todayData && todayData.fajr && todayData.dhuhr && todayData.asr && todayData.maghrib && todayData.isha;
    
    if (!todayDone) {
      currentDate = addDays(currentDate, -1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const day = data[dateStr];
      if (!day) break;
      const allDone = day.fajr && day.dhuhr && day.asr && day.maghrib && day.isha;
      if (!allDone) break;
      streak++;
      currentDate = addDays(currentDate, -1);
    }
    
    // Add today to streak if it was done
    return streak + (todayDone ? 1 : 0);
  }, [data]);

  const getTotalPrayers = useCallback(() => {
    let total = 0;
    Object.values(data).forEach(day => {
      if (day.fajr) total++;
      if (day.dhuhr) total++;
      if (day.asr) total++;
      if (day.maghrib) total++;
      if (day.isha) total++;
    });
    return total;
  }, [data]);
  
  const getWeeklyStats = useCallback((weekStart: Date) => {
    let completed = 0;
    let total = 35; // 7 days * 5 prayers
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = data[dateStr] || { ...defaultDay };
      
      const dayCompleted = Object.values(dayData).filter(Boolean).length;
      completed += dayCompleted;
      
      weekDays.push({
        date,
        dateStr,
        data: dayData,
        completed: dayCompleted,
      });
    }
    
    return {
      weekDays,
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [data]);

  return { data, getDay, togglePrayer, getStreak, getTotalPrayers, getWeeklyStats };
}
