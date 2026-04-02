import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, Trash2, MessageCircle, Bot, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function AiChat() {
  const { isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [selectedConvTitle, setSelectedConvTitle] = useState<string>("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversations = [], isLoading: convsLoading } = useListOpenaiConversations({
    query: { enabled: isAuthenticated },
  });

  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  const { data: convData } = useGetOpenaiConversation(selectedConvId ?? 0, {
    query: { enabled: !!selectedConvId },
  });

  useEffect(() => {
    if (convData?.messages) {
      setStreamMessages(
        convData.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      );
    }
  }, [convData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamMessages]);

  const openConversation = (id: number, title: string) => {
    setSelectedConvId(id);
    setSelectedConvTitle(title);
    setStreamMessages([]);
    setMobileView("chat");
  };

  const createNewConversation = async () => {
    const title =
      language === "ar"
        ? `محادثة ${new Date().toLocaleDateString("ar-EG")}`
        : `Chat ${new Date().toLocaleDateString()}`;
    const conv = await createConv.mutateAsync({ data: { title } });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    openConversation(conv.id, conv.title);
  };

  const handleDeleteConv = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    if (selectedConvId === id) {
      setSelectedConvId(null);
      setStreamMessages([]);
      setMobileView("list");
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || !selectedConvId) return;

    const userMessage = input.trim();
    setInput("");
    setStreamMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "", isStreaming: true },
    ]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        `${BASE_URL}/api/openai/conversations/${selectedConvId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userMessage }),
          credentials: "include",
          signal: controller.signal,
        }
      );

      if (!response.ok || !response.body) throw new Error("Request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const data = JSON.parse(json);
            if (data.content) {
              setStreamMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + data.content };
                }
                return next;
              });
            }
            if (data.done) {
              setStreamMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, isStreaming: false };
                }
                return next;
              });
              queryClient.invalidateQueries({
                queryKey: getGetOpenaiConversationQueryKey(selectedConvId),
              });
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setStreamMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              content:
                language === "ar"
                  ? "حدث خطأ. حاول مرة أخرى."
                  : "An error occurred. Please try again.",
              isStreaming: false,
            };
          }
          return next;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, selectedConvId, language, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Unauthenticated ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Bot className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
          {language === "ar" ? "المساعد الإسلامي" : "Islamic AI Assistant"}
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {language === "ar"
            ? "سجّل دخولك للحصول على إجابات دقيقة لأسئلتك الإسلامية من علماء الأزهر ودار الإفتاء."
            : "Log in to ask Islamic questions and receive scholarly answers grounded in Al-Azhar and Dar al-Ifta sources."}
        </p>
        <Link href="/login">
          <Button className="rounded-full px-8">
            {language === "ar" ? "تسجيل الدخول" : "Log in"}
          </Button>
        </Link>
      </div>
    );
  }

  // ── Sidebar / conversation list content ──────────────────────────────────────
  const SidebarContent = (
    <>
      <Button
        onClick={createNewConversation}
        disabled={createConv.isPending}
        className="rounded-2xl w-full flex items-center gap-2 flex-shrink-0"
      >
        {createConv.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {language === "ar" ? "محادثة جديدة" : "New Conversation"}
      </Button>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {convsLoading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm pt-8 px-4">
            {language === "ar"
              ? "لا توجد محادثات بعد. أنشئ محادثة جديدة."
              : "No conversations yet. Create one above."}
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all",
                selectedConvId === conv.id
                  ? "bg-primary/15 border border-primary/25"
                  : "hover:bg-muted/60 border border-transparent"
              )}
              onClick={() => openConversation(conv.id, conv.title)}
            >
              <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm text-foreground truncate">{conv.title}</span>
              <button
                onClick={(e) => handleDeleteConv(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );

  // ── Chat panel content ────────────────────────────────────────────────────────
  const ChatContent = (
    <>
      {!selectedConvId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Bot className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-3">
            {language === "ar" ? "المساعد الإسلامي" : "Islamic AI Assistant"}
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {language === "ar"
              ? "اسأل عن أي مسألة فقهية أو دينية. تستند إجاباتنا إلى دار الإفتاء المصرية والأزهر الشريف."
              : "Ask any Islamic question. Answers are grounded in Dar al-Ifta and Al-Azhar scholarly sources."}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4 max-w-xs">
            {language === "ar"
              ? "ابدأ بإنشاء محادثة جديدة."
              : "Start by creating a new conversation."}
          </p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 min-h-0">
            {streamMessages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-12">
                {language === "ar"
                  ? "اكتب سؤالك الإسلامي في الأسفل..."
                  : "Type your Islamic question below..."}
              </div>
            )}
            {streamMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 md:gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[78%] rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50"
                  )}
                  dir={msg.role === "assistant" ? "auto" : undefined}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-1 rounded-sm" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-border/50 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === "ar"
                    ? "اكتب سؤالك هنا..."
                    : "Type your question here..."
                }
                disabled={isStreaming}
                rows={1}
                dir="auto"
                className="flex-1 resize-none rounded-2xl bg-background border border-border px-3 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground disabled:opacity-50 overflow-y-auto"
                style={{ minHeight: "46px", maxHeight: "120px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="rounded-2xl w-11 h-11 flex-shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-2 text-center leading-relaxed">
              {language === "ar"
                ? "الإجابات مستندة إلى دار الإفتاء والأزهر."
                : "Answers grounded in Dar al-Ifta & Al-Azhar sources."}
            </p>
          </div>
        </>
      )}
    </>
  );

  // ── Desktop layout (side-by-side) ─────────────────────────────────────────────
  // ── Mobile layout (stacked, slide between list and chat) ──────────────────────
  return (
    <>
      {/* ── MOBILE ── */}
      <div className="flex flex-col md:hidden" style={{ height: "calc(100dvh - 7rem)" }}>
        {mobileView === "list" ? (
          /* Mobile: Conversation list */
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 pb-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h1 className="font-serif font-bold text-foreground text-lg">
                {language === "ar" ? "المساعد الإسلامي" : "Islamic Assistant"}
              </h1>
            </div>
            {SidebarContent}
          </div>
        ) : (
          /* Mobile: Chat view */
          <div className="flex flex-col h-full glass rounded-3xl overflow-hidden border border-primary/10">
            {/* Mobile chat header with back button */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 flex-shrink-0">
              <button
                onClick={() => setMobileView("list")}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-foreground truncate">
                  {selectedConvTitle || (language === "ar" ? "المساعد الإسلامي" : "Islamic Assistant")}
                </span>
              </div>
            </div>
            {ChatContent}
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex gap-4" style={{ height: "calc(100vh - 12rem)" }}>
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-3">
          {SidebarContent}
        </aside>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col glass rounded-3xl overflow-hidden border border-primary/10 min-w-0">
          {ChatContent}
        </div>
      </div>
    </>
  );
}
