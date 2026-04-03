import { useEffect, useRef } from 'react';

const SOCIAL_NOTIF_PERMISSION_CHECK = typeof Notification !== 'undefined';

export function useSocialNotifications(
  pendingRequests: number,
  unreadMessages: number,
  isAuthenticated: boolean
) {
  const prevPending = useRef<number | null>(null);
  const prevUnread = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !SOCIAL_NOTIF_PERMISSION_CHECK) return;
    if (Notification.permission !== 'granted') return;

    if (prevPending.current !== null && pendingRequests > prevPending.current) {
      const diff = pendingRequests - prevPending.current;
      try {
        new Notification('👥 New Friend Request', {
          body: diff === 1
            ? 'Someone sent you a friend request.'
            : `You have ${diff} new friend requests.`,
          icon: '/favicon.svg',
          tag: `friend-request-${Date.now()}`,
        });
      } catch {}
    }

    if (prevUnread.current !== null && unreadMessages > prevUnread.current) {
      const diff = unreadMessages - prevUnread.current;
      try {
        new Notification('💬 New Message', {
          body: diff === 1
            ? 'You have a new message.'
            : `You have ${diff} new messages.`,
          icon: '/favicon.svg',
          tag: `new-message-${Date.now()}`,
        });
      } catch {}
    }

    prevPending.current = pendingRequests;
    prevUnread.current = unreadMessages;
  }, [pendingRequests, unreadMessages, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      prevPending.current = null;
      prevUnread.current = null;
    }
  }, [isAuthenticated]);
}
