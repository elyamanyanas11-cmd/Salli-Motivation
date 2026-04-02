import { Router, type IRouter } from "express";
import bcryptjs from "bcryptjs";
import { eq, ilike } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SALT_ROUNDS = 12;

function toAuthUser(user: { id: number; displayName: string; username?: string | null; email: string; city: string | null; createdAt: Date }) {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username ?? null,
    email: user.email,
    city: user.city ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

async function generateUniqueUsername(base: string): Promise<string> {
  const slug = base
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 25) || "user";

  const [existing] = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(ilike(usersTable.username, slug));

  if (!existing) return slug;

  // Try appending numbers
  for (let i = 1; i <= 9999; i++) {
    const candidate = `${slug}${i}`;
    const [dup] = await db
      .select({ username: usersTable.username })
      .from(usersTable)
      .where(ilike(usersTable.username, candidate));
    if (!dup) return candidate;
  }
  return `${slug}_${Date.now()}`;
}

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { displayName, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);
  const username = await generateUniqueUsername(displayName);

  const [user] = await db
    .insert(usersTable)
    .values({ displayName, email: email.toLowerCase(), passwordHash, username })
    .returning({
      id: usersTable.id,
      displayName: usersTable.displayName,
      username: usersTable.username,
      email: usersTable.email,
      city: usersTable.city,
      createdAt: usersTable.createdAt,
    });

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error");
      res.status(500).json({ error: "Failed to create session." });
      return;
    }
    res.status(201).json(toAuthUser(user));
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const valid = await bcryptjs.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error");
      res.status(500).json({ error: "Failed to create session." });
      return;
    }
    res.json(toAuthUser(user));
  });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Session destroy error");
    }
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get("/auth/me", (req, res): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const u = req.user;
  res.json({
    id: u.id,
    displayName: u.displayName,
    username: u.username ?? null,
    email: u.email,
    city: u.city ?? null,
    createdAt: u.createdAt.toISOString(),
  });
});

export default router;
