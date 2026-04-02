import { Router, type IRouter } from "express";
import { eq, or, and, sql, desc, ne, ilike } from "drizzle-orm";
import { db, usersTable, friendships, directMessages } from "@workspace/db";

const router: IRouter = Router();

function toSocialUser(
  u: { id: number; displayName: string; username: string | null; city: string | null },
  status: "none" | "pending_sent" | "pending_received" | "friends"
) {
  return {
    id: u.id,
    displayName: u.displayName,
    username: u.username ?? null,
    city: u.city ?? null,
    friendshipStatus: status,
  };
}

async function getFriendshipStatus(
  myId: number,
  otherId: number
): Promise<"none" | "pending_sent" | "pending_received" | "friends"> {
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, myId), eq(friendships.addresseeId, otherId)),
        and(eq(friendships.requesterId, otherId), eq(friendships.addresseeId, myId))
      )
    );
  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  if (row.status === "declined") return "none";
  if (row.requesterId === myId) return "pending_sent";
  return "pending_received";
}

// GET /api/social/users/search?q=...
router.get("/social/users/search", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const q = String(req.query.q ?? "").replace(/^@/, "").trim();
  if (!q || q.length < 2) {
    res.json([]);
    return;
  }

  const users = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username, city: usersTable.city })
    .from(usersTable)
    .where(
      and(
        ne(usersTable.id, req.user.id),
        or(
          ilike(usersTable.username, `%${q}%`),
          ilike(usersTable.displayName, `%${q}%`)
        )
      )
    )
    .limit(20);

  const results = await Promise.all(
    users.map(async (u) => toSocialUser(u, await getFriendshipStatus(req.user.id, u.id)))
  );

  res.json(results);
});

// GET /api/social/friends
router.get("/social/friends", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const myId = req.user.id;
  const rows = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(eq(friendships.requesterId, myId), eq(friendships.addresseeId, myId)),
        eq(friendships.status, "accepted")
      )
    );

  const friendIds = rows.map((r) => (r.requesterId === myId ? r.addresseeId : r.requesterId));
  if (friendIds.length === 0) {
    res.json([]);
    return;
  }

  const friendUsers = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username, city: usersTable.city })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${friendIds})`);

  res.json(friendUsers.map((u) => toSocialUser(u, "friends")));
});

// GET /api/social/friends/requests
router.get("/social/friends/requests", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const rows = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.addresseeId, req.user.id), eq(friendships.status, "pending")))
    .orderBy(desc(friendships.createdAt));

  if (rows.length === 0) {
    res.json([]);
    return;
  }

  const requesterIds = rows.map((r) => r.requesterId);
  const requesters = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username, city: usersTable.city })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${requesterIds})`);

  const requesterMap = new Map(requesters.map((u) => [u.id, u]));
  const result = rows
    .map((r) => {
      const u = requesterMap.get(r.requesterId);
      if (!u) return null;
      return {
        id: r.id,
        user: toSocialUser(u, "pending_received"),
        createdAt: r.createdAt.toISOString(),
      };
    })
    .filter(Boolean);

  res.json(result);
});

// POST /api/social/friends/request/:userId
router.post("/social/friends/request/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const targetId = Number(req.params.userId);
  const myId = req.user.id;

  if (targetId === myId) {
    res.status(400).json({ error: "Cannot send a friend request to yourself" });
    return;
  }

  const [target] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, targetId));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, myId), eq(friendships.addresseeId, targetId)),
        and(eq(friendships.requesterId, targetId), eq(friendships.addresseeId, myId))
      )
    );

  if (existing) {
    if (existing.status === "accepted") {
      res.status(400).json({ error: "Already friends" });
      return;
    }
    if (existing.status === "pending") {
      res.status(400).json({ error: "Friend request already sent or pending" });
      return;
    }
    // declined — re-send by updating
    await db
      .update(friendships)
      .set({ requesterId: myId, addresseeId: targetId, status: "pending", updatedAt: new Date() })
      .where(eq(friendships.id, existing.id));
    res.json({ success: true });
    return;
  }

  await db.insert(friendships).values({ requesterId: myId, addresseeId: targetId, status: "pending" });
  res.json({ success: true });
});

// POST /api/social/friends/accept/:userId
router.post("/social/friends/accept/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const requesterId = Number(req.params.userId);
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.addresseeId, req.user.id),
        eq(friendships.status, "pending")
      )
    );

  if (!row) {
    res.status(404).json({ error: "Friend request not found" });
    return;
  }

  await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(friendships.id, row.id));

  res.json({ success: true });
});

// POST /api/social/friends/decline/:userId
router.post("/social/friends/decline/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const requesterId = Number(req.params.userId);
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.addresseeId, req.user.id),
        eq(friendships.status, "pending")
      )
    );

  if (!row) {
    res.status(404).json({ error: "Friend request not found" });
    return;
  }

  await db
    .update(friendships)
    .set({ status: "declined", updatedAt: new Date() })
    .where(eq(friendships.id, row.id));

  res.json({ success: true });
});

// DELETE /api/social/friends/:userId  (unfriend or cancel sent request)
router.delete("/social/friends/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const otherId = Number(req.params.userId);
  const myId = req.user.id;

  const [row] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, myId), eq(friendships.addresseeId, otherId)),
        and(eq(friendships.requesterId, otherId), eq(friendships.addresseeId, myId))
      )
    );

  if (!row) {
    res.status(404).json({ error: "Friendship not found" });
    return;
  }

  await db.delete(friendships).where(eq(friendships.id, row.id));
  res.json({ success: true });
});

// GET /api/social/messages  (list threads)
router.get("/social/messages", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const myId = req.user.id;

  // Get all messages involving me
  const allMsgs = await db
    .select()
    .from(directMessages)
    .where(or(eq(directMessages.senderId, myId), eq(directMessages.receiverId, myId)))
    .orderBy(desc(directMessages.createdAt));

  // Group by partner
  const threadMap = new Map<number, typeof allMsgs[0]>();
  const unreadMap = new Map<number, number>();

  for (const msg of allMsgs) {
    const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
    if (!threadMap.has(partnerId)) {
      threadMap.set(partnerId, msg);
    }
    if (msg.senderId !== myId && !msg.readAt) {
      unreadMap.set(partnerId, (unreadMap.get(partnerId) ?? 0) + 1);
    }
  }

  if (threadMap.size === 0) {
    res.json([]);
    return;
  }

  const partnerIds = Array.from(threadMap.keys());
  const partnerUsers = await db
    .select({ id: usersTable.id, displayName: usersTable.displayName, username: usersTable.username, city: usersTable.city })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${partnerIds})`);

  const userMap = new Map(partnerUsers.map((u) => [u.id, u]));

  const threads = await Promise.all(
    partnerIds.map(async (pid) => {
      const u = userMap.get(pid);
      const lastMsg = threadMap.get(pid)!;
      const status = u ? await getFriendshipStatus(myId, pid) : "none" as const;
      return {
        partner: u ? toSocialUser(u, status) : { id: pid, displayName: "Unknown", username: null, city: null, friendshipStatus: "none" as const },
        lastMessage: {
          id: lastMsg.id,
          senderId: lastMsg.senderId,
          receiverId: lastMsg.receiverId,
          content: lastMsg.content,
          readAt: lastMsg.readAt?.toISOString() ?? null,
          createdAt: lastMsg.createdAt.toISOString(),
        },
        unreadCount: unreadMap.get(pid) ?? 0,
      };
    })
  );

  // Sort by last message date descending
  threads.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

  res.json(threads);
});

// GET /api/social/messages/:userId
router.get("/social/messages/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const partnerId = Number(req.params.userId);
  const myId = req.user.id;

  const msgs = await db
    .select()
    .from(directMessages)
    .where(
      or(
        and(eq(directMessages.senderId, myId), eq(directMessages.receiverId, partnerId)),
        and(eq(directMessages.senderId, partnerId), eq(directMessages.receiverId, myId))
      )
    )
    .orderBy(directMessages.createdAt);

  // Mark received messages as read
  const unread = msgs.filter((m) => m.senderId === partnerId && !m.readAt);
  if (unread.length > 0) {
    await db
      .update(directMessages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(directMessages.senderId, partnerId),
          eq(directMessages.receiverId, myId),
          sql`${directMessages.readAt} IS NULL`
        )
      );
  }

  res.json(
    msgs.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      content: m.content,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    }))
  );
});

// POST /api/social/messages/:userId
router.post("/social/messages/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const receiverId = Number(req.params.userId);
  const myId = req.user.id;
  const content = String(req.body?.content ?? "").trim();

  if (!content) {
    res.status(400).json({ error: "Message content cannot be empty" });
    return;
  }

  const [target] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, receiverId));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [msg] = await db
    .insert(directMessages)
    .values({ senderId: myId, receiverId, content })
    .returning();

  res.status(201).json({
    id: msg.id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    content: msg.content,
    readAt: msg.readAt?.toISOString() ?? null,
    createdAt: msg.createdAt.toISOString(),
  });
});

// PUT /api/social/messages/:userId/read
router.put("/social/messages/:userId/read", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const senderId = Number(req.params.userId);
  const myId = req.user.id;

  await db
    .update(directMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(directMessages.senderId, senderId),
        eq(directMessages.receiverId, myId),
        sql`${directMessages.readAt} IS NULL`
      )
    );

  res.json({ success: true });
});

// GET /api/social/notifications/count
router.get("/social/notifications/count", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const myId = req.user.id;

  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(friendships)
    .where(and(eq(friendships.addresseeId, myId), eq(friendships.status, "pending")));

  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(directMessages)
    .where(and(eq(directMessages.receiverId, myId), sql`${directMessages.readAt} IS NULL`));

  res.json({
    pendingRequests: pendingResult?.count ?? 0,
    unreadMessages: unreadResult?.count ?? 0,
  });
});

export default router;
