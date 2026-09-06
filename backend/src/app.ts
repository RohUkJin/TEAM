import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { apiRouter } from "./routes";

/**
 * Middleware 실행 순서:
 * 1) CORS
 * 2) Cookie parser
 * 3) JSON body parser
 * 4) Swagger docs
 * 5) /api routes
 * 6) 404 notFoundHandler
 * 7) 전역 errorHandler
 */
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use(express.json());

  setupSwagger(app);

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
