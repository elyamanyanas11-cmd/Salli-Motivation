import { useEffect, useRef } from 'react';
import { useGetFriendActivity } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';

const PRAYER_EMOJI: Record<string, string> = {
  fajr: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌇',
  isha: '🌙',
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function useFriendActivityNotifications() {
  const { isAuthenticated } = useAuth();
  const seenRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  const { data: activities = [] } = useGetFriendActivity({
    query: {
      enabled: isAuthenticated,
      refetchInterval: 30000,
    },
  });

  useEffect(() => {
    if (!isAuthenticated || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    // On first load, seed the seen set without firing notifications
    if (!initializedRef.current) {
      activities.forEach((a) => seenRef.current.add(a.activityId));
      initializedRef.current = true;
      return;
    }

    // On subsequent polls, fire for any new activity
    for (const item of activities) {
      if (!seenRef.current.has(item.activityId)) {
        seenRef.current.add(item.activityId);
        const emoji = PRAYER_EMOJI[item.prayer] || '🕌';
        try {
          new Notification(`${emoji} ${item.displayName} prayed ${capitalize(item.prayer)}!`, {
            body: `Masha'Allah! ${item.displayName} just completed ${capitalize(item.prayer)}.`,
            icon: '/favicon.svg',
            tag: `friend-prayer-${item.activityId}`,
          });
        } catch {}
      }
    }
  }, [activities, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      initializedRef.current = false;
      seenRef.current.clear();
    }
  }, [isAuthenticated]);
}
