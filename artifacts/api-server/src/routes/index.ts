import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import locationsRouter from "./locations";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(locationsRouter);
router.use(dashboardRouter);

export default router;
