import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { logger } from "./lib/logger";
import router from "./routes";
const app: Express = express();

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.log = logger.child({
    method: req.method,
    url: req.url?.split("?")[0],
  });
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
