import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onyxAuthRouter from "./onyx-auth";
import onyxConversationsRouter from "./onyx-conversations";
import onyxMessagesRouter from "./onyx-messages";
import onyxSettingsRouter from "./onyx-settings";
import onyxSavedPromptsRouter from "./onyx-saved-prompts";
import onyxStatsRouter from "./onyx-stats";
const router: IRouter = Router();

router.use(healthRouter);
router.use(onyxAuthRouter);
router.use(onyxConversationsRouter);
router.use(onyxMessagesRouter);
router.use(onyxSettingsRouter);
router.use(onyxSavedPromptsRouter);
router.use(onyxStatsRouter);

export default router;
