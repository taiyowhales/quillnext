import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { curriculumRouter } from "./routers/curriculum";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  curriculum: curriculumRouter,
});

export type AppRouter = typeof appRouter;

