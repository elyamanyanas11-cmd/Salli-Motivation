import { Router, type IRouter } from "express";
import { eq, and, ne, ilike } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

// PATCH /api/users/profile
router.patch("/users/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const myId = req.user.id;

  // Check username uniqueness if provided
  if (parsed.data.username) {
    const slug = parsed.data.username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 30);

    const [dup] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(ilike(usersTable.username, slug), ne(usersTable.id, myId)));

    if (dup) {
      res.status(409).json({ error: "Username is already taken" });
      return;
    }
    parsed.data.username = slug;
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      displayName: parsed.data.displayName,
      ...(parsed.data.username !== undefined ? { username: parsed.data.username } : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city } : {}),
    })
    .where(eq(usersTable.id, myId))
    .returning({
      id: usersTable.id,
      displayName: usersTable.displayName,
      username: usersTable.username,
      email: usersTable.email,
      city: usersTable.city,
      createdAt: usersTable.createdAt,
    });

  res.json({
    id: updated.id,
    displayName: updated.displayName,
    username: updated.username ?? null,
    email: updated.email,
    city: updated.city ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
