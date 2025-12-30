---
alwaysApply: false
---
# ACADEMIC SPINE & CURRICULUM INTEGRATION GUIDE

## 1. Philosophy: "No Blank Canvases"
We never ask a user to "Write a lesson." We ask them to "Select a Goal," and we immediately provide the scaffolding (Objectives, Pacing, and specialized Tools) required to achieve it.

**The Flow:**
1.  User selects **Subject** (e.g., History) -> **Grade** (e.g., 5).
2.  System retrieves **Sequenced Standards** from DB (Pre-loaded from JSON).
3.  System looks up **ResourceKinds** (from YAML) associated with that Subject's Strand.
4.  UI presents:
    * A pre-filled timeline (from Sequencing data).
    * Specific buttons: "Create Timeline," "Analyze Primary Source" (NOT generic "Create Content").

---

## 2. Data Ingestion Strategy (Prisma Seed)

We do not read JSON files at runtime. We seed them into the database to allow relational queries and foreign key constraints.

### 2.1 The Mapping
* `academic_standards_master.json` -> Populates `Subject`, `Strand`, `Topic`, `Subtopic`, `Objective`.
* `academic_standards_sequenced.json` -> Updates `Objective` with `gradeLevel`, `complexity`, and `sortOrder`.
* `GENERATOR_CONTENT_TYPES.YAML` -> Populates `ResourceKind` and links them to `Strand` IDs.

### 2.2 The Seeding Script (`prisma/seed.ts`)
*Context: Cursor, use this pattern to populate the database.*

```typescript
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import yaml from "js-yaml";

const prisma = new PrismaClient();

async function main() {
  // 1. Load Master Standards
  const standardsRaw = fs.readFileSync("data/academic_standards_master.json", "utf-8");
  const standards = JSON.parse(standardsRaw);

  // Recursive function to insert hierarchy
  for (const subject of standards.subjects) {
    const dbSubject = await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: {
        code: subject.code,
        name: subject.name,
        // ... mappings
      }
    });

    // ... Iterate Strands, Topics, Subtopics, Objectives
  }

  // 2. Load Content Types (The "Glue")
  const yamlRaw = fs.readFileSync("data/GENERATOR_CONTENT_TYPES.YAML", "utf-8");
  const contentTypes = yaml.load(yamlRaw) as Record<string, any>;

  for (const [strandCode, config] of Object.entries(contentTypes)) {
    // Find the strand ID by code
    const strand = await prisma.strand.findFirst({ where: { code: strandCode } });
    
    if (strand && config.generators) {
      for (const gen of config.generators) {
        await prisma.resourceKind.upsert({
          where: { code: gen.id }, // e.g., "primary_source_analysis"
          update: {},
          create: {
            code: gen.id,
            label: gen.label,
            contentType: gen.type, // Maps to Enum
            strandId: strand.id,   // THE CRITICAL LINK
            isSpecialized: true
          }
        });
      }
    }
  }
}