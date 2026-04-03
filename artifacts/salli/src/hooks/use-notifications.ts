import { useState, useEffect, useCallback, useRef } from 'react';
import type { PrayerName } from '@/lib/prayer-times';
import { PRAYER_NAMES, IQAMA_OFFSET_MINUTES } from '@/lib/prayer-times';

type NotifPref = {
  adhan: boolean;
  iqama: boolean;
  reminderMinutes: number;
};

const NOTIF_STORAGE_KEY = 'salli_notif_prefs';
const FIRED_KEY = 'salli_notif_fired';

const DEFAULT_PREFS: NotifPref = {
  adhan: true,
  iqama: true,
  reminderMinutes: 10,
};

export function useNotifications(prayerTimes: Record<PrayerName, Date> | null) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [prefs, setPrefs] = useState<NotifPref>(() => {
    try {
      const s = localStorage.getItem(NOTIF_STORAGE_KEY);
      return s ? { ...DEFAULT_PREFS, ...JSON.parse(s) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const firedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const updatePrefs = useCallback((patch: Partial<NotifPref>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const sendNotif = useCallback((title: string, body: string, tag: string) => {
    if (permission !== 'granted') return;
    if (firedRef.current.has(tag)) return;
    firedRef.current.add(tag);
    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag,
        requireInteraction: false,
      });
    } catch {}
  }, [permission]);

  useEffect(() => {
    if (!prayerTimes || permission !== 'granted') return;

    const interval = setInterval(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      for (const prayer of PRAYER_NAMES) {
        const adhanTime = prayerTimes[prayer];
        const iqamaTime = new Date(adhanTime.getTime() + IQAMA_OFFSET_MINUTES[prayer] * 60000);
        const diffAdhan = Math.round((adhanTime.getTime() - now.getTime()) / 1000);
        const diffIqama = Math.round((iqamaTime.getTime() - now.getTime()) / 1000);
        const reminderSecs = prefs.reminderMinutes * 60;
        const name = prayer.charAt(0).toUpperCase() + prayer.slice(1);

        if (prefs.adhan && diffAdhan >= reminderSecs - 30 && diffAdhan <= reminderSecs + 30) {
          sendNotif(
            `🕌 ${name} in ${prefs.reminderMinutes} minutes`,
            `${name} prayer time is approaching. Prepare yourself.`,
            `${dateStr}-${prayer}-reminder`
          );
        }
        if (prefs.adhan && diffAdhan >= -30 && diffAdhan <= 30) {
          sendNotif(
            `🔔 ${name} Prayer Time`,
            `It is time for ${name} prayer. Allahu Akbar!`,
            `${dateStr}-${prayer}-adhan`
          );
        }
        if (prefs.iqama && diffIqama >= -30 && diffIqama <= 30) {
          sendNotif(
            `🕌 ${name} Iqama`,
            `Iqama for ${name} — prayer is starting now!`,
            `${dateStr}-${prayer}-iqama`
          );
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [prayerTimes, permission, prefs, sendNotif]);

  return { permission, requestPermission, prefs, updatePrefs };
}
