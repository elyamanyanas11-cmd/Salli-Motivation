import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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

  const [updated] = await db
    .update(usersTable)
    .set({
      displayName: parsed.data.displayName,
      ...(parsed.data.city !== undefined ? { city: parsed.data.city } : {}),
    })
    .where(eq(usersTable.id, req.user.id))
    .returning({
      id: usersTable.id,
      displayName: usersTable.displayName,
      email: usersTable.email,
      city: usersTable.city,
      createdAt: usersTable.createdAt,
    });

  res.json({
    id: updated.id,
    displayName: updated.displayName,
    email: updated.email,
    city: updated.city ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
