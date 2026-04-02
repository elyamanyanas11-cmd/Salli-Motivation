import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import {
  useListMessageThreads,
  useGetMessageThread,
  useSendDirectMessage,
} from "@workspace/api-client-react";
import type { MessageThread, DirectMessage } from "@workspace/api-zod";
import { Send, ArrowLeft, MessageCircle, UserCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function ThreadItem({
  thread,
  isActive,
  myId,
  onClick,
  isRTL,
}: {
  thread: MessageThread;
  isActive: boolean;
  myId: number;
  onClick: () => void;
  isRTL: boolean;
}) {
  const { t } = useLanguage();
  const isYou = thread.lastMessage.senderId === myId;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-semibold text-sm">
          {thread.partner.displayName.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm truncate">{thread.partner.displayName}</p>
          {thread.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {thread.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {isYou ? `${t.messages.you}: ` : ""}{thread.lastMessage.content}
        </p>
      </div>
    </button>
  );
}

function ChatView({
  userId,
  partnerName,
  myId,
  onBack,
}: {
  userId: number;
  partnerName: string;
  myId: number;
  onBack: () => void;
}) {
  const { t, isRTL } = useLanguage();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useGetMessageThread(userId, {
    query: {
      enabled: true,
      refetchInterval: 5000,
    },
  });

  const send = useSendDirectMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = message.trim();
    if (!content) return;
    setMessage("");
    send.mutate(
      { userId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["getMessageThread", userId] });
          queryClient.invalidateQueries({ queryKey: ["listMessageThreads"] });
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50 flex-shrink-0">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-xs">
            {partnerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-sm">{partnerName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground py-4">{t.common.loading}</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === myId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] px-3 py-2 rounded-2xl text-sm",
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                <p>{msg.content}</p>
                <p className={cn(
                  "text-[10px] mt-0.5 opacity-70",
                  isMine ? "text-right" : "text-left"
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t.messages.typeMessage}
            className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || send.isPending}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const { t, isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [matchChat, chatParams] = useRoute("/messages/:userId");
  const activeUserId = matchChat ? Number(chatParams!.userId) : null;
  const [mobileView, setMobileView] = useState<"list" | "chat">(activeUserId ? "chat" : "list");

  const { data: threads = [], isLoading } = useListMessageThreads({
    query: { enabled: isAuthenticated, refetchInterval: 10000 },
  });

  const activeThread = threads.find((t) => t.partner.id === activeUserId);
  const partnerName = activeThread?.partner.displayName ?? "...";

  useEffect(() => {
    if (activeUserId) setMobileView("chat");
  }, [activeUserId]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <MessageCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t.messages.loginRequired}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {t.nav.login}
        </button>
      </div>
    );
  }

  const goToThread = (userId: number) => {
    navigate(`/messages/${userId}`);
    setMobileView("chat");
  };

  const goBack = () => {
    navigate("/messages");
    setMobileView("list");
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ height: "calc(100dvh - 7rem)" }}>
      <div className="flex h-full rounded-2xl border border-border/50 overflow-hidden bg-card">
        {/* Thread List — always visible on desktop, toggle on mobile */}
        <div
          className={cn(
            "flex flex-col border-r border-border/50 bg-background",
            "w-full md:w-64 md:flex-shrink-0",
            mobileView === "chat" ? "hidden md:flex" : "flex"
          )}
        >
          <div className="p-3 border-b border-border/50">
            <h2 className="font-serif font-semibold text-base">{t.messages.title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">{t.common.loading}</p>
            ) : threads.length === 0 ? (
              <div className="text-center py-10 space-y-2 px-3">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{t.messages.noThreads}</p>
                <p className="text-xs text-muted-foreground">{t.messages.noThreadsHint}</p>
                <button
                  onClick={() => navigate("/social")}
                  className="text-xs text-primary hover:underline"
                >
                  {t.social.title} →
                </button>
              </div>
            ) : (
              threads.map((thread) => (
                <ThreadItem
                  key={thread.partner.id}
                  thread={thread}
                  isActive={thread.partner.id === activeUserId}
                  myId={user!.id}
                  onClick={() => goToThread(thread.partner.id)}
                  isRTL={isRTL}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            mobileView === "list" ? "hidden md:flex" : "flex"
          )}
        >
          {activeUserId ? (
            <ChatView
              key={activeUserId}
              userId={activeUserId}
              partnerName={partnerName}
              myId={user!.id}
              onBack={goBack}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <UserCircle2 className="w-12 h-12 opacity-30" />
              <p className="text-sm">{t.messages.noThreads}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
