import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useLink } from "wouter";
import { cn } from "@/lib/utils";
import {
  useSearchUsers,
  useListFriends,
  useListFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
} from "@workspace/api-client-react";
import type { SocialUser } from "@workspace/api-zod";
import { Search, UserPlus, UserCheck, UserX, Users, Bell, MessageCircle, X } from "lucide-react";
import { useLocation } from "wouter";

type Tab = "search" | "friends" | "requests";

function UserCard({
  user,
  onAction,
  actionLabel,
  actionVariant,
  secondaryAction,
  secondaryLabel,
  badge,
}: {
  user: SocialUser;
  onAction?: () => void;
  actionLabel?: string;
  actionVariant?: "primary" | "danger" | "ghost";
  secondaryAction?: () => void;
  secondaryLabel?: string;
  badge?: string;
}) {
  const [, navigate] = useLocation();
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-semibold text-sm">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{user.displayName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.username ? `@${user.username}` : ""}
          {user.city ? (user.username ? ` · ${user.city}` : user.city) : ""}
        </p>
        {badge && (
          <span className="text-xs text-primary/70 font-medium">{badge}</span>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {user.friendshipStatus === "friends" && (
          <button
            onClick={() => navigate(`/messages/${user.id}`)}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Message"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}
        {secondaryAction && secondaryLabel && (
          <button
            onClick={secondaryAction}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              actionVariant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
              actionVariant === "danger" && "text-destructive border border-destructive/30 hover:bg-destructive/10",
              actionVariant === "ghost" && "text-muted-foreground border border-border hover:bg-muted"
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Social() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: searchResults = [], isLoading: searching } = useSearchUsers(
    { q: debouncedQuery },
    { query: { enabled: isAuthenticated && debouncedQuery.length >= 2 } }
  );
  const { data: friends = [], refetch: refetchFriends } = useListFriends({
    query: { enabled: isAuthenticated },
  });
  const { data: requests = [], refetch: refetchRequests } = useListFriendRequests({
    query: { enabled: isAuthenticated },
  });

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const removeRequest = useRemoveFriend();

  const handleSearch = (val: string) => {
    setQuery(val);
    clearTimeout((window as any)._st);
    (window as any)._st = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const refetchAll = () => {
    refetchFriends();
    refetchRequests();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <Users className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t.social.loginRequired}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {t.nav.login}
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "friends", label: t.social.friendsTab, icon: UserCheck, count: friends.length || undefined },
    { id: "requests", label: t.social.requestsTab, icon: Bell, count: requests.length || undefined },
    { id: "search", label: t.social.searchTab, icon: Search },
  ];

  return (
    <div className="max-w-lg mx-auto py-4 space-y-4">
      <h1 className="text-2xl font-serif font-bold text-primary">{t.social.title}</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                tab === id ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {tab === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.social.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 rtl:pl-4 rtl:pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setDebouncedQuery(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rtl:right-auto rtl:left-3"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {debouncedQuery.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t.social.searchHint}</p>
          )}
          {searching && debouncedQuery.length >= 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t.common.loading}</p>
          )}
          {!searching && debouncedQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t.social.noResults}</p>
          )}
          <div className="space-y-2">
            {searchResults.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onAction={
                  u.friendshipStatus === "none"
                    ? () => sendRequest.mutate({ userId: u.id }, { onSuccess: () => { refetchAll(); } })
                    : u.friendshipStatus === "pending_sent"
                    ? () => removeRequest.mutate({ userId: u.id }, { onSuccess: () => { refetchAll(); } })
                    : u.friendshipStatus === "pending_received"
                    ? () => acceptRequest.mutate({ userId: u.id }, { onSuccess: () => { refetchAll(); } })
                    : undefined
                }
                actionLabel={
                  u.friendshipStatus === "none"
                    ? t.social.addFriend
                    : u.friendshipStatus === "pending_sent"
                    ? t.social.cancelRequest
                    : u.friendshipStatus === "pending_received"
                    ? t.social.accept
                    : undefined
                }
                actionVariant={
                  u.friendshipStatus === "none"
                    ? "primary"
                    : u.friendshipStatus === "pending_sent"
                    ? "ghost"
                    : "primary"
                }
                secondaryAction={
                  u.friendshipStatus === "pending_received"
                    ? () => declineRequest.mutate({ userId: u.id }, { onSuccess: () => { refetchAll(); } })
                    : u.friendshipStatus === "friends"
                    ? () => removeRequest.mutate({ userId: u.id }, { onSuccess: () => { refetchAll(); } })
                    : undefined
                }
                secondaryLabel={
                  u.friendshipStatus === "pending_received"
                    ? t.social.decline
                    : u.friendshipStatus === "friends"
                    ? t.social.unfriend
                    : undefined
                }
                badge={
                  u.friendshipStatus === "pending_sent"
                    ? t.social.pendingSent
                    : u.friendshipStatus === "friends"
                    ? t.social.friendSince
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {tab === "friends" && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Users className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t.social.noFriends}</p>
              <button
                onClick={() => setTab("search")}
                className="text-sm text-primary hover:underline"
              >
                {t.social.searchTab} →
              </button>
            </div>
          ) : (
            friends.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onAction={() => removeRequest.mutate({ userId: u.id }, { onSuccess: refetchAll })}
                actionLabel={t.social.unfriend}
                actionVariant="danger"
              />
            ))
          )}
        </div>
      )}

      {/* Requests Tab */}
      {tab === "requests" && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t.social.noRequests}</p>
            </div>
          ) : (
            requests.map((req) => (
              <UserCard
                key={req.id}
                user={req.user}
                badge={t.social.pendingReceived}
                onAction={() =>
                  acceptRequest.mutate({ userId: req.user.id }, { onSuccess: refetchAll })
                }
                actionLabel={t.social.accept}
                actionVariant="primary"
                secondaryAction={() =>
                  declineRequest.mutate({ userId: req.user.id }, { onSuccess: refetchAll })
                }
                secondaryLabel={t.social.decline}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
