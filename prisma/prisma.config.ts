import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",

    datasource: {
        // Direct connection URL for CLI operations (migrations, generate, studio)
        // Railway build will use DIRECT_DATABASE_URL if available, otherwise DATABASE_URL
        url: env("DIRECT_DATABASE_URL") || env("DATABASE_URL"),
    },
});
