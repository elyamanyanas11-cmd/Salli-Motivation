import { useState, useEffect, useCallback } from 'react';
import { calculatePrayerTimes, getIqamaTimes, getNextPrayerFromTimes, PRAYER_NAMES, type PrayerName } from '@/lib/prayer-times';
import { differenceInSeconds } from 'date-fns';

export type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; lat: number; lng: number; city?: string }
  | { status: 'denied'; error: string };

export type CountdownPhase = 'adhan' | 'iqama';

const LOCATION_STORAGE_KEY = 'salli_location';

function buildCountdown(time: Date, now: Date) {
  const diffSeconds = Math.max(0, differenceInSeconds(time, now));
  return {
    hours: Math.floor(diffSeconds / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
    totalSeconds: diffSeconds,
    percentage: Math.min(100, Math.max(0, 100 - (diffSeconds / (4 * 3600)) * 100)),
  };
}

export function usePrayerTimes() {
  const [location, setLocation] = useState<LocationState>(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { status: 'idle' };
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = useCallback(() => {
    setLocation({ status: 'loading' });
    if (!navigator.geolocation) {
      setLocation({ status: 'denied', error: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city: string | undefined;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
        } catch {}
        const newLoc = { status: 'granted' as const, lat, lng, city };
        setLocation(newLoc);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
      },
      (err) => {
        const errState = { status: 'denied' as const, error: err.message };
        setLocation(errState);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const prayerTimes =
    location.status === 'granted'
      ? calculatePrayerTimes(location.lat, location.lng, now)
      : null;

  const iqamaTimes = prayerTimes ? getIqamaTimes(prayerTimes) : null;

  const nextPrayer =
    prayerTimes && location.status === 'granted'
      ? getNextPrayerFromTimes(prayerTimes, now, location.lat, location.lng)
      : null;

  // Determine if we're currently in the "between adhan and iqama" window for any prayer
  const iqamaPhase: { prayer: PrayerName; iqamaTime: Date } | null = (() => {
    if (!prayerTimes || !iqamaTimes) return null;
    for (const prayer of PRAYER_NAMES) {
      const adhan = prayerTimes[prayer];
      const iqama = iqamaTimes[prayer];
      if (now >= adhan && now < iqama) {
        return { prayer, iqamaTime: iqama };
      }
    }
    return null;
  })();

  const countdown = (() => {
    if (iqamaPhase) {
      return {
        phase: 'iqama' as CountdownPhase,
        prayer: iqamaPhase.prayer,
        time: iqamaPhase.iqamaTime,
        isTomorrow: false,
        ...buildCountdown(iqamaPhase.iqamaTime, now),
      };
    }
    if (nextPrayer) {
      return {
        phase: 'adhan' as CountdownPhase,
        prayer: nextPrayer.prayer,
        time: nextPrayer.time,
        isTomorrow: nextPrayer.isTomorrow,
        ...buildCountdown(nextPrayer.time, now),
      };
    }
    return null;
  })();

  return {
    location,
    requestLocation,
    prayerTimes,
    iqamaTimes,
    nextPrayer,
    iqamaPhase,
    countdown,
    now,
  };
}
