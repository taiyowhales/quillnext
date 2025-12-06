# Database Integration for Quill Standards

## Overview

The quill-standards system has been fully integrated into the Prisma database schema. This enables the Course Builder and AI systems to access the complete hierarchical structure of academic standards, including all metadata (UUIDs, complexity scores, grade level assignments, etc.).

## Schema Updates

### Models Updated

All hierarchy models have been enhanced with quill-standards metadata:

1. **Subject**
   - `standardId` (String, unique) - e.g., "ART", "BIB", "MAT"
   - `uuid` (String?, unique) - UUID from quill-standards

2. **SubSubject**
   - `standardId` (String, unique) - e.g., "ART.1", "ART.2"
   - `shortCode` (String?) - e.g., "1", "2"
   - `uuid` (String?, unique) - UUID from quill-standards

3. **Topic**
   - `standardId` (String, unique) - e.g., "ART.1.1", "ART.1.2"
   - `shortCode` (String?) - e.g., "1", "2"
   - `uuid` (String?, unique) - UUID from quill-standards

4. **SubTopic**
   - `standardId` (String, unique) - e.g., "ART.1.1.1", "ART.1.1.2"
   - `shortCode` (String?) - e.g., "1", "2"
   - `uuid` (String?, unique) - UUID from quill-standards

5. **LearningObjective**
   - `standardId` (String, unique) - e.g., "ART.1.1.1.1", "ART.1.1.1.2"
   - `shortCode` (String?) - e.g., "1", "2"
   - `uuid` (String?, unique) - UUID from quill-standards
   - `complexity` (Int?) - Complexity score (1-6 based on Bloom's Taxonomy)
   - `gradeLevel` (Int?) - Specific grade level from sequencing (0=K, 1-12)
   - `gradeBand` (String?) - Legacy field, kept for backward compatibility

## Migration Script

A comprehensive migration script has been created at:
`server/scripts/seed-quill-standards-complete.js`

### Features

- Reads from `academic_standards_master.json` for complete hierarchical structure
- Reads from `academic_standards_sequenced.json` for grade level and complexity assignments
- Populates all fields including UUIDs, standardIds, shortCodes, complexity, and gradeLevel
- Uses upserts to allow safe re-running
- Provides detailed progress logging

### Usage

```bash
cd server
node scripts/seed-quill-standards-complete.js
```

## Data Structure

The script processes:

1. **Master Data** (`academic_standards_master.json`)
   - Complete hierarchical structure
   - All UUIDs and standardIds
   - All shortCodes

2. **Sequenced Data** (`academic_standards_sequenced.json`)
   - Grade level assignments (0-12, where 0 = Kindergarten)
   - Complexity scores (1-6 based on Bloom's Taxonomy)
   - Maps objectives by UUID to their sequenced data

## Benefits for Course Builder & AI

### Course Builder

- **Subject Selection**: Can query subjects by standardId or UUID
- **Objective Filtering**: Filter objectives by grade level, complexity, or subject hierarchy
- **Prerequisite Mapping**: Use complexity and grade level to determine prerequisites
- **Scope & Sequence**: Access complete K-12 progression for any subject

### AI Accuracy

- **Context-Aware**: AI can access full hierarchical context (Subject → SubSubject → Topic → SubTopic)
- **Grade-Appropriate**: Filter objectives by grade level to ensure age-appropriate content
- **Complexity Matching**: Match content complexity to student readiness
- **Standard Alignment**: Link generated content to specific standards via standardId or UUID

## Query Examples

### Get all objectives for a specific grade level

```typescript
const objectives = await prisma.learningObjective.findMany({
  where: {
    gradeLevel: 5, // 5th grade
    isActive: true,
  },
  include: {
    subTopic: {
      include: {
        topic: {
          include: {
            subSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    },
  },
});
```

### Get objectives by complexity range

```typescript
const objectives = await prisma.learningObjective.findMany({
  where: {
    complexity: {
      gte: 3, // Apply level and above
      lte: 5, // Evaluate level and below
    },
    isActive: true,
  },
});
```

### Get objectives by subject hierarchy

```typescript
const objectives = await prisma.learningObjective.findMany({
  where: {
    subTopic: {
      topic: {
        subSubject: {
          subject: {
            standardId: 'ART', // Fine Arts
          },
        },
      },
    },
    isActive: true,
  },
});
```

### Find objective by standardId

```typescript
const objective = await prisma.learningObjective.findUnique({
  where: {
    standardId: 'ART.1.1.1.1',
  },
  include: {
    subTopic: {
      include: {
        topic: {
          include: {
            subSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    },
  },
});
```

## Indexes

All new fields are properly indexed for performance:

- `standardId` - Unique indexes on all models
- `uuid` - Unique indexes on all models
- `gradeLevel` - Index on LearningObjective
- `complexity` - Index on LearningObjective
- Composite indexes for common query patterns

## Next Steps

1. **Run Migration**: Execute the seed script to populate the database
2. **Update Course Builder**: Integrate standardId/UUID lookups into course creation
3. **Enhance AI Prompts**: Include grade level and complexity in AI context
4. **Add API Endpoints**: Create endpoints for querying standards by various criteria
5. **Build UI Components**: Create components for browsing standards hierarchy

## Notes

- The `gradeBand` field on LearningObjective is kept for backward compatibility but `gradeLevel` is preferred
- All UUIDs from quill-standards are preserved for cross-referencing
- The `standardId` field provides a human-readable identifier that matches the quill-standards structure
- The migration script is idempotent and can be run multiple times safely

