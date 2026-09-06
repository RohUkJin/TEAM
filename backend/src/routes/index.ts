import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { blogRoutes } from "./blog.routes";
import { commentRoutes } from "./comment.routes";
import { feedRoutes } from "./feed.routes";
import { healthRoutes } from "./health.routes";
import { postRoutes } from "./post.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/feed", feedRoutes);
apiRouter.use("/blogs", blogRoutes);
apiRouter.use("/posts", postRoutes);
apiRouter.use("/comments", commentRoutes);

export { apiRouter };
