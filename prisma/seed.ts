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
          strands?: Array<{
            id?: string;
            code: string;
            name: string;
            description?: string;
            topics?: Array<{
              id?: string;
              code: string;
              name: string;
              description?: string;
              sub_topics?: Array<{
                id?: string;
                code: string;
                name: string;
                description?: string;
                objectives?: Array<{
                  id?: string;
                  code: string;
                  text: string;
                  description?: string;
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
      path.join(process.cwd(), "quill-standards", "academic_standards_sequenced.json"),
      path.join(process.cwd(), "prisma", "data", "quill-standards", "academic_standards_sequenced.json"),
    ];
    const sequencedPath = sequencedPaths.find((p) => fs.existsSync(p));

    if (fs.existsSync(sequencedPath)) {
      const sequencedRaw = fs.readFileSync(sequencedPath, "utf-8");
      const sequenced = JSON.parse(sequencedRaw) as {
        objectives?: Array<{
          objectiveId?: string;
          code?: string;
          gradeLevel?: number;
          complexity?: number;
          sortOrder?: number;
        }>;
      };

      if (sequenced.objectives) {
        for (const seqObj of sequenced.objectives) {
          if (seqObj.code) {
            await prisma.objective.updateMany({
              where: { code: seqObj.code },
              data: {
                gradeLevel: seqObj.gradeLevel ?? null,
                complexity: seqObj.complexity ?? null,
                sortOrder: seqObj.sortOrder ?? 0,
              },
            });
          }
        }
        console.log(`  ✓ Updated ${sequenced.objectives.length} objectives with sequencing data`);
      }
    } else {
      console.warn("⚠️  academic_standards_sequenced.json not found. Skipping sequencing.");
    }

    // 3. Load Content Types (The "Glue" - ResourceKind)
    console.log("🔗 Loading generator content types...");
    const yamlPath = path.join(process.cwd(), "GENERATOR_CONTENT_TYPES.YAML");

    if (!fs.existsSync(yamlPath)) {
      console.warn("⚠️  GENERATOR_CONTENT_TYPES.YAML not found. Skipping ResourceKind seeding.");
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

      for (const [strandCode, config] of Object.entries(contentTypes)) {
        // Find the strand by code (format: "BIB.1", "ELA.2", etc.)
        const strand = await prisma.strand.findFirst({
          where: { code: strandCode },
        });

        if (strand && config.generators) {
          for (const gen of config.generators) {
            // Map YAML type to ResourceContentType enum
            const contentTypeMap: Record<string, "WORKSHEET" | "TEMPLATE" | "PROMPT" | "GUIDE" | "QUIZ" | "RUBRIC" | "LESSON_PLAN" | "OTHER"> =
              {
                worksheet: "WORKSHEET",
                template: "TEMPLATE",
                prompt: "PROMPT",
                guide: "GUIDE",
                quiz: "QUIZ",
                rubric: "RUBRIC",
                "lesson-plan": "LESSON_PLAN",
              };

            const contentType = contentTypeMap[gen.type?.toLowerCase() || ""] || "OTHER";

            await prisma.resourceKind.upsert({
              where: { code: gen.id },
              update: {
                label: gen.label,
                description: gen.description,
                contentType,
              },
              create: {
                code: gen.id,
                label: gen.label,
                description: gen.description,
                contentType,
                strandId: strand.id,
                isSpecialized: true, // These are strand-specific
              },
            });

            resourceKindCount++;
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
