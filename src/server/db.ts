import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Prisma 7 Configuration (Pure Accelerate):
// - Vercel (Frontend): Uses DATABASE_URL="prisma://..." (Active pooling via Accelerate)
// - Railway (Backend): Uses DATABASE_URL="postgresql://..." (Direct TCP)
// - We rely on the environment variable strictly.
// - The "Client" engine (Wasm) rejects 'datasourceUrl' and 'datasources' properties at runtime.
// - It requires the DATABASE_URL to be 'prisma://' (Accelerate) or an adapter to be present.
// - Since we are "Pure Accelerate", we pass NO arguments and expect the env var to be sufficient.

const makePrismaClient = () => {
  // We cast to any because the generated types might not expose accelerateUrl
  // but the runtime error explicitly requests it.
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  } as any).$extends(withAccelerate());
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient> | undefined;
};

// Revert to singleton to prevent connection leaks
export const db = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Forces HMR to pick up new Prisma Client
export const timestamp = new Date().toISOString();
