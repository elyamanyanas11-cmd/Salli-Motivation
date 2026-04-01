import { Request, Response, NextFunction } from "express";
import { User } from "@workspace/db";

// Augment the Express session and Request types
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "passwordHash">;
      isAuthenticated(): this is AuthenticatedRequest;
    }
    interface AuthenticatedRequest extends Request {
      user: Omit<User, "passwordHash">;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  req.isAuthenticated = function (this: Request): this is Express.AuthenticatedRequest {
    return !!this.user;
  };

  if (req.session?.userId) {
    try {
      const { db, usersTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      const [user] = await db
        .select({
          id: usersTable.id,
          displayName: usersTable.displayName,
          email: usersTable.email,
          city: usersTable.city,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, req.session.userId));

      if (user) {
        req.user = user;
      }
    } catch {
      // session lookup failed, proceed without user
    }
  }

  next();
}
