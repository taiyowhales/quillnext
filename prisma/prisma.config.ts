import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),

    datasource: {
        // Direct connection for migrations, seeds, and local CLI operations
        url: env("DIRECT_DATABASE_URL") || env("DATABASE_URL"),
    },
});
