import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Create a direct Prisma client for seeding (without Accelerate extension)
// This avoids Accelerate communication issues during bulk seeding operations
const createPrismaClient = () => {
  const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or DIRECT_DATABASE_URL environment variable is required");
  }

  // Use direct connection for seeding (no Accelerate extension)
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
  });
};

const prisma = createPrismaClient();

/**
 * Database Seeding Script
 * 
 * Seeds the Academic Spine from JSON files and ResourceKinds from YAML
 * Based on CURRICULUM_INTEGRATION_GUIDE.mdc
 */
async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Load Master Standards
    console.log("📚 Loading academic standards...");
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), "quill-standards", "academic_standards_master.json"),
      path.join(process.cwd(), "prisma", "data", "quill-standards", "academic_standards_master.json"),
    ];

    const standardsPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!standardsPath) {
      console.warn("⚠️  academic_standards_master.json not found in any expected location. Skipping standards seeding.");
      console.warn("   Tried:", possiblePaths);
    } else {
      const standardsRaw = fs.readFileSync(standardsPath, "utf-8");
      const standards = JSON.parse(standardsRaw) as {
        subjects?: Array<{
          id?: string;
          code: string;
          name: string;
          description?: string;
          uuid?: string;
          sub_subjects?: Array<{
            id?: string;
            code: string;
            name: string;
            description?: string;
            short_code?: string;
            uuid?: string;
            topics?: Array<{
              id?: string;
              code: string;
              name: string;
              description?: string;
              short_code?: string;
              uuid?: string;
              sub_topics?: Array<{
                id?: string;
                code: string;
                name: string;
                description?: string;
                short_code?: string;
                uuid?: string;
                objectives?: Array<{
                  id?: string;
                  code: string;
                  text: string;
                  short_code?: string;
                  description?: string;
                  uuid?: string;
                }>;
              }>;
            }>;
          }>;
        }>;
      };

      if (standards.subjects) {
        for (const subject of standards.subjects) {
          // Map JSON "id" to database "code" (e.g., "ART" -> code)
          const subjectCode = subject.id || subject.code;

          // Upsert Subject
          const dbSubject = await prisma.subject.upsert({
            where: { code: subjectCode },
            update: {
              name: subject.name,
              description: subject.description,
            },
            create: {
              code: subjectCode,
              name: subject.name,
              description: subject.description,
              uuid: subject.uuid,
              sortOrder: 0, // Will be updated from sequenced data
            },
          });

          console.log(`  ✓ Subject: ${subject.name}`);

          // Process SubSubjects (JSON calls them "sub_subjects", schema calls them "strands")
          if (subject.sub_subjects) {
            for (const strand of subject.sub_subjects) {
              const strandCode = strand.id || strand.code;

              const dbStrand = await prisma.strand.upsert({
                where: {
                  subjectId_code: {
                    subjectId: dbSubject.id,
                    code: strandCode,
                  },
                },
                update: {
                  name: strand.name,
                  description: strand.description,
                },
                create: {
                  subjectId: dbSubject.id,
                  code: strandCode,
                  shortCode: strand.short_code,
                  name: strand.name,
                  description: strand.description,
                  uuid: strand.uuid,
                  sortOrder: 0,
                },
              });

              // Process Topics
              if (strand.topics) {
                for (const topic of strand.topics) {
                  const topicCode = topic.id || topic.code;

                  const dbTopic = await prisma.topic.upsert({
                    where: {
                      strandId_code: {
                        strandId: dbStrand.id,
                        code: topicCode,
                      },
                    },
                    update: {
                      name: topic.name,
                      description: topic.description,
                    },
                    create: {
                      strandId: dbStrand.id,
                      code: topicCode,
                      shortCode: topic.short_code,
                      name: topic.name,
                      description: topic.description,
                      uuid: topic.uuid,
                      sortOrder: 0,
                    },
                  });

                  // Process Subtopics
                  if (topic.sub_topics) {
                    for (const subtopic of topic.sub_topics) {
                      const subtopicCode = subtopic.id || subtopic.code;

                      const dbSubtopic = await prisma.subtopic.upsert({
                        where: {
                          topicId_code: {
                            topicId: dbTopic.id,
                            code: subtopicCode,
                          },
                        },
                        update: {
                          name: subtopic.name,
                          description: subtopic.description,
                        },
                        create: {
                          topicId: dbTopic.id,
                          code: subtopicCode,
                          shortCode: subtopic.short_code,
                          name: subtopic.name,
                          description: subtopic.description,
                          uuid: subtopic.uuid,
                          sortOrder: 0,
                        },
                      });

                      // Process Objectives
                      if (subtopic.objectives) {
                        for (const objective of subtopic.objectives) {
                          const objectiveCode = objective.id || objective.code;

                          await prisma.objective.upsert({
                            where: { code: objectiveCode },
                            update: {
                              text: objective.text,
                            },
                            create: {
                              subtopicId: dbSubtopic.id,
                              code: objectiveCode,
                              shortCode: objective.short_code,
                              text: objective.text,
                              uuid: objective.uuid,
                              sortOrder: 0, // Will be updated from sequenced data
                            },
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // 2. Load Sequenced Standards (updates gradeLevel, complexity, sortOrder)
    console.log("📊 Loading sequenced standards...");
    const sequencedPaths = [
      path.join(process.cwd(), "prisma", "data", "quill-standards", "academic_standards_sequenced.json"),
      path.join(process.cwd(), "quill-standards", "academic_standards_sequenced.json"),
    ];
    const sequencedPath = sequencedPaths.find((p) => fs.existsSync(p));

    if (sequencedPath && fs.existsSync(sequencedPath)) {
      const sequencedRaw = fs.readFileSync(sequencedPath, "utf-8");
      const sequenced = JSON.parse(sequencedRaw) as {
        curriculum_sequence?: {
          grade_levels?: Record<string, {
            grade_number?: number;
            subjects?: Record<string, {
              objectives?: Array<{
                objective_id?: string;
                objective_uuid?: string;
                grade?: number;
                complexity?: number;
              }>;
            }>;
          }>;
        };
      };

      let updatedCount = 0;

      if (sequenced.curriculum_sequence?.grade_levels) {
        // Iterate through all grade levels
        for (const gradeLevelData of Object.values(sequenced.curriculum_sequence.grade_levels)) {
          if (gradeLevelData.subjects) {
            // Iterate through all subjects in this grade level
            for (const subjectData of Object.values(gradeLevelData.subjects)) {
              if (subjectData.objectives) {
                // Update each objective
                for (const seqObj of subjectData.objectives) {
                  if (seqObj.objective_id) {
                    const result = await prisma.objective.updateMany({
                      where: { code: seqObj.objective_id },
                      data: {
                        gradeLevel: seqObj.grade ?? null,
                        complexity: seqObj.complexity ?? null,
                      },
                    });
                    updatedCount += result.count;
                  }
                }
              }
            }
          }
        }
        console.log(`  ✓ Updated ${updatedCount} objectives with sequencing data`);
      } else {
        console.warn("⚠️  Sequenced data structure not recognized. Skipping sequencing.");
      }
    } else {
      console.warn("⚠️  academic_standards_sequenced.json not found. Skipping sequencing.");
      console.warn("   Tried:", sequencedPaths);
    }

    // 3. Load Content Types (The "Glue" - ResourceKind)
    console.log("🔗 Loading generator content types...");
    const yamlPaths = [
      path.join(process.cwd(), "prisma", "data", "GENERATOR_CONTENT_TYPES.YAML"),
      path.join(process.cwd(), "GENERATOR_CONTENT_TYPES.YAML"),
    ];
    const yamlPath = yamlPaths.find((p) => fs.existsSync(p));

    if (!yamlPath || !fs.existsSync(yamlPath)) {
      console.warn("⚠️  GENERATOR_CONTENT_TYPES.YAML not found. Skipping ResourceKind seeding.");
      console.warn("   Tried:", yamlPaths);
    } else {
      const yamlRaw = fs.readFileSync(yamlPath, "utf-8");
      const contentTypes = yaml.load(yamlRaw) as Record<
        string,
        {
          generators?: Array<{
            id: string;
            label: string;
            type?: string;
            description?: string;
          }>;
        }
      >;

      let resourceKindCount = 0;

      for (const [level1Key, level1Value] of Object.entries(contentTypes)) {
        // level1Key could be a Subject Name ("Bible & Theology") or Strand Code ("BIB.1")
        // level1Value is Record<string, string[]> -> { Subcategory: ["Item 1", "Item 2"] }

        // Attempt to resolve to a Strand or Subject
        let strandId: string | null = null;
        let subjectId: string | null = null;

        // 1. Try as Strand Code
        const strand = await prisma.strand.findFirst({ where: { code: level1Key } });
        if (strand) {
          strandId = strand.id;
          subjectId = strand.subjectId; // Optional: denormalize subjectId? Schema has subjectId on ResourceKind.
        } else {
          // 2. Try as Subject Name (since Level 1 keys in YAML are often Subject Names)
          const subject = await prisma.subject.findFirst({ where: { name: level1Key } });
          if (subject) {
            subjectId = subject.id;
          }
        }

        // If "Universal Tools & Templates", we leave strandId/subjectId as null (Global)

        if (level1Value && typeof level1Value === 'object') {
          for (const [subCategory, items] of Object.entries(level1Value as Record<string, string[]>)) {
            if (Array.isArray(items)) {
              for (const itemLabel of items) {
                // Generate a stable code/id from the label
                const code = itemLabel
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");

                // Determine Content Type based on keywords
                let contentType: "WORKSHEET" | "TEMPLATE" | "PROMPT" | "GUIDE" | "QUIZ" | "RUBRIC" | "OTHER" = "OTHER";
                const labelLower = itemLabel.toLowerCase();
                if (labelLower.includes("worksheet") || labelLower.includes("sheet")) contentType = "WORKSHEET";
                else if (labelLower.includes("template") || labelLower.includes("plan") || labelLower.includes("outline")) contentType = "TEMPLATE";
                else if (labelLower.includes("prompt") || labelLower.includes("starter")) contentType = "PROMPT";
                else if (labelLower.includes("guide") || labelLower.includes("summary") || labelLower.includes("analysis")) contentType = "GUIDE";
                else if (labelLower.includes("quiz") || labelLower.includes("test")) contentType = "QUIZ";
                else if (labelLower.includes("rubric")) contentType = "RUBRIC";

                // Determine Vision Requirement
                const visualKeywords = [
                  "Visual", "Diagram", "Map", "Chart", "Sketching", "Drawing",
                  "Art", "Picture", "Image", "Photo", "Video", "Film",
                  "Observation", "Identification", "Labeling", "Timeline", "Graph"
                ];
                const requiresVision = visualKeywords.some(k => itemLabel.includes(k));

                await prisma.resourceKind.upsert({
                  where: { code },
                  update: {
                    label: itemLabel,
                    description: `Generate a ${itemLabel} for ${subCategory}`,
                    contentType,
                    requiresVision,
                    // Don't overwrite strandId/subjectId on update if it might have been manually set?
                    // Actually, if we are re-seeding, we enforce the structure.
                    strandId,
                    subjectId,
                  },
                  create: {
                    code,
                    label: itemLabel,
                    description: `Generate a ${itemLabel} for ${subCategory}`,
                    contentType,
                    strandId,
                    subjectId,
                    isSpecialized: !!(strandId || subjectId), // Specialized if attached to a domain
                    requiresVision,
                  },
                });
                resourceKindCount++;
              }
            }
          }
        }
      }

      console.log(`  ✓ Created/updated ${resourceKindCount} ResourceKind entries`);
    }

    console.log("✅ Seed completed successfully!");
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
