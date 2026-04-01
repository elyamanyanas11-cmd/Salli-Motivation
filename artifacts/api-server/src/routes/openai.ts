import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, conversations, messages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { SendOpenaiMessageBody, CreateOpenaiConversationBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ISLAMIC_SYSTEM_PROMPT = `أنت مساعد إسلامي متخصص يُجيب على الأسئلة الدينية الإسلامية بدقة واحترافية.

مصادر الإجابة المعتمدة:
- دار الإفتاء المصرية (dar-alifta.org)
- مجمع البحوث الإسلامية بالأزهر الشريف (azhar.eg)
- القرآن الكريم
- صحيح البخاري وصحيح مسلم والكتب الحديثية المعتمدة
- المذاهب الفقهية الأربعة (الحنفي والمالكي والشافعي والحنبلي)

قواعد الإجابة:
1. أجب بالعربية الفصحى أولاً، ويمكن تقديم توضيح بالإنجليزية إذا طُلب
2. استشهد بالآيات القرآنية والأحاديث النبوية عند الاقتضاء مع ذكر المصدر
3. إذا كانت المسألة خلافية، اذكر الآراء الفقهية المختلفة مع أدلتها
4. كن متوازناً ومعتدلاً وابتعد عن التطرف
5. إذا لم تعرف الجواب، اعترف بذلك وأرشد المستخدم لسؤال عالم متخصص
6. لا تُفتي في المسائل الطبية أو القانونية بشكل قاطع
7. أجب بأسلوب علمي رصين مع الاحترام والتواضع

You can also respond in English if the user asks in English, while maintaining the same scholarly approach and citing Islamic sources.`;

// GET /api/openai/conversations
router.get("/openai/conversations", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const userId = req.user.id;
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(asc(conversations.createdAt));
  res.json(convs.map((c) => ({ id: c.id, title: c.title, createdAt: c.createdAt.toISOString() })));
});

// POST /api/openai/conversations
router.post("/openai/conversations", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [conv] = await db
    .insert(conversations)
    .values({ userId: req.user.id, title: parsed.data.title })
    .returning();
  res.status(201).json({ id: conv.id, title: conv.title, createdAt: conv.createdAt.toISOString() });
});

// GET /api/openai/conversations/:id
router.get("/openai/conversations/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const id = Number(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== req.user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json({
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
    messages: msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

// DELETE /api/openai/conversations/:id
router.delete("/openai/conversations/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const id = Number(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== req.user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(messages).where(eq(messages.conversationId, id));
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
});

// GET /api/openai/conversations/:id/messages
router.get("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const id = Number(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== req.user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json(
    msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
  );
});

// POST /api/openai/conversations/:id/messages  (SSE streaming)
router.post("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const id = Number(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== req.user.id) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const parsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userContent = parsed.data.content;

  // Save user message
  await db.insert(messages).values({ conversationId: id, role: "user", content: userContent });

  // Build conversation history
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const chatMessages = [
    { role: "system" as const, content: ISLAMIC_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant response
    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
  } catch (err) {
    req.log.error({ err }, "OpenAI streaming error");
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
