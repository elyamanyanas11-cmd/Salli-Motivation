import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import prayersRouter from "./prayers";
import leaderboardRouter from "./leaderboard";
import openaiRouter from "./openai";
import socialRouter from "./social";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(prayersRouter);
router.use(leaderboardRouter);
router.use(openaiRouter);
router.use(socialRouter);

export default router;
