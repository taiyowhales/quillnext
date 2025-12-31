import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Create a direct Prisma client for seeding (without Accelerate extension)
const createPrismaClient = () => {
  const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or DIRECT_DATABASE_URL environment variable is required");
  }

  // Pass no arguments, relying on env var (standard Library engine)
  return new PrismaClient();
};

const prisma = createPrismaClient();

/**
 * Standalone seed script for Generator Content Types (ResourceKind)
 * 
 * Parses GENERATOR_CONTENT_TYPES.YAML and seeds ResourceKind entries
 * with proper strand and subject associations.
 */
async function main() {
  console.log("🌱 Starting generator content types seed...");

  try {
    // Load YAML file
    const yamlPaths = [
      path.join(process.cwd(), "prisma", "data", "GENERATOR_CONTENT_TYPES.YAML"),
      path.join(process.cwd(), "GENERATOR_CONTENT_TYPES.YAML"),
    ];
    const yamlPath = yamlPaths.find((p) => fs.existsSync(p));

    if (!yamlPath || !fs.existsSync(yamlPath)) {
      throw new Error(`GENERATOR_CONTENT_TYPES.YAML not found. Tried: ${yamlPaths.join(", ")}`);
    }

    console.log(`📄 Loading YAML from: ${yamlPath}`);
    const yamlRaw = fs.readFileSync(yamlPath, "utf-8");
    const contentTypes = yaml.load(yamlRaw) as Record<string, Record<string, string[]>>;

    if (!contentTypes || typeof contentTypes !== "object") {
      throw new Error("Invalid YAML structure. Expected object with subject -> strand -> generators mapping.");
    }

    // Helper function to slugify a string for use as a code
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 100); // Limit length
    }

    // Helper function to infer content type from generator name
    function inferContentType(name: string): "WORKSHEET" | "TEMPLATE" | "PROMPT" | "GUIDE" | "QUIZ" | "RUBRIC" | "OTHER" {
      const lower = name.toLowerCase();

      if (lower.includes("worksheet") || lower.includes("practice sheet") || lower.includes("drill")) {
        return "WORKSHEET";
      }
      if (lower.includes("template") || lower.includes("outline")) {
        return "TEMPLATE";
      }
      if (lower.includes("prompt") || lower.includes("generator") || lower.includes("starter")) {
        return "PROMPT";
      }
      if (lower.includes("guide") || lower.includes("instruction") || lower.includes("how-to")) {
        return "GUIDE";
      }
      if (lower.includes("quiz") || lower.includes("test") || lower.includes("assessment")) {
        return "QUIZ";
      }
      if (lower.includes("rubric") || lower.includes("scoring")) {
        return "RUBRIC";
      }
      // Note: LESSON_PLAN is not in the enum, so lesson plans map to OTHER
      if (lower.includes("lesson plan") || lower.includes("lesson-plan")) {
        return "OTHER";
      }

      return "OTHER";
    }

    let resourceKindCount = 0;
    let skippedCount = 0;
    const skippedItems: Array<{ subject: string; strand: string; generator: string; reason: string }> = [];

    // Iterate through subjects (top level)
    for (const [subjectName, strands] of Object.entries(contentTypes)) {
      if (!strands || typeof strands !== "object") {
        console.warn(`⚠️  Skipping invalid subject entry: ${subjectName}`);
        continue;
      }

      // Find subject by name (try exact match and variations)
      let subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { name: { equals: subjectName, mode: "insensitive" as const } },
            { name: subjectName },
          ],
        },
      });

      // If exact match failed, try contains
      if (!subject) {
        subject = await prisma.subject.findFirst({
          where: {
            OR: [
              { name: { contains: subjectName.split(" ")[0], mode: "insensitive" as const } }, // Try first word
              { name: { contains: subjectName, mode: "insensitive" as const } },
            ],
          },
        });
      }

      if (!subject) {
        console.warn(`⚠️  Subject not found: "${subjectName}". Skipping all strands under this subject.`);
        skippedCount += Object.values(strands).flat().length;
        continue;
      }

      console.log(`\n📚 Processing subject: ${subject.name} (${subject.code})`);

      // Iterate through strands (second level)
      for (const [strandName, generators] of Object.entries(strands)) {
        if (!Array.isArray(generators)) {
          console.warn(`⚠️  Skipping invalid strand entry: ${subjectName} > ${strandName}`);
          continue;
        }

        // Find strand by name within this subject
        // Try multiple matching strategies for better matching
        const cleanStrandName = strandName.trim();
        const strandNameVariations = [
          cleanStrandName, // Exact match
          cleanStrandName.split(":")[0].trim(), // Before colon
          cleanStrandName.split("(")[0].trim(), // Before parenthesis
          cleanStrandName.replace(/\([^)]*\)/g, "").trim(), // Remove parenthetical content
        ].filter((v, i, arr) => v && arr.indexOf(v) === i && v.length > 0); // Remove duplicates and empty strings

        let strand = await prisma.strand.findFirst({
          where: {
            subjectId: subject.id,
            OR: [
              { name: { equals: cleanStrandName, mode: "insensitive" as const } }, // Exact match (case insensitive)
              ...strandNameVariations.slice(1).map((variant) => ({
                name: { equals: variant, mode: "insensitive" as const },
              })),
            ],
          },
        });

        // If exact match failed, try contains matching
        if (!strand) {
          strand = await prisma.strand.findFirst({
            where: {
              subjectId: subject.id,
              OR: [
                { name: { contains: cleanStrandName.split(":")[0].trim(), mode: "insensitive" as const } },
                { name: { contains: cleanStrandName.split("(")[0].trim(), mode: "insensitive" as const } },
                { name: { contains: cleanStrandName, mode: "insensitive" as const } },
              ],
            },
          });
        }


        if (!strand) {
          console.warn(`  ⚠️  Strand not found: "${strandName}" in subject "${subjectName}". Skipping ${generators.length} generators.`);
          skippedCount += generators.length;
          generators.forEach((gen) => {
            skippedItems.push({
              subject: subjectName,
              strand: strandName,
              generator: gen,
              reason: "Strand not found in database",
            });
          });
          continue;
        }

        console.log(`  📖 Processing strand: ${strand.name} (${strand.code})`);

        // Process each generator (third level - array of strings)
        for (const generatorName of generators) {
          if (typeof generatorName !== "string" || !generatorName.trim()) {
            console.warn(`    ⚠️  Skipping invalid generator: ${generatorName}`);
            skippedCount++;
            continue;
          }

          const code = slugify(generatorName);
          const contentType = inferContentType(generatorName);

          try {
            await prisma.resourceKind.upsert({
              where: { code },
              update: {
                label: generatorName,
                contentType,
                strandId: strand.id,
                subjectId: subject.id,
                isSpecialized: true,
              },
              create: {
                code,
                label: generatorName,
                contentType,
                strandId: strand.id,
                subjectId: subject.id,
                isSpecialized: true,
              },
            });

            resourceKindCount++;
            console.log(`    ✓ ${generatorName} (${code}) -> ${contentType}`);
          } catch (error) {
            console.error(`    ❌ Failed to upsert ${generatorName}:`, error);
            skippedCount++;
            skippedItems.push({
              subject: subjectName,
              strand: strandName,
              generator: generatorName,
              reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
            });
          }
        }
      }
    }

    console.log(`\n✅ Seed completed!`);
    console.log(`   ✓ Created/updated ${resourceKindCount} ResourceKind entries`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  Skipped ${skippedCount} entries`);
      if (skippedItems.length > 0) {
        console.log(`\n   Skipped items:`);
        skippedItems.slice(0, 10).forEach((item) => {
          console.log(`     - ${item.subject} > ${item.strand} > ${item.generator} (${item.reason})`);
        });
        if (skippedItems.length > 10) {
          console.log(`     ... and ${skippedItems.length - 10} more`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

