import { PrismaClient } from "../src/generated/client";

const createPrismaClient = () => {
  const directUrl = process.env.DIRECT_DATABASE_URL;
  if (directUrl) {
    process.env.DATABASE_URL = directUrl;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL or DIRECT_DATABASE_URL environment variable is required");
  }

  return new PrismaClient();
};

const db = createPrismaClient();

async function seedTestBook() {
  const user = await db.user.findFirst();
  if (!user?.organizationId) {
    console.error("No user/org found");
    return;
  }

  const subject = await db.subject.findFirst();

  if (!subject) {
    console.log("No subjects found, please run db:seed first");
    return;
  }

  await db.book.create({
    data: {
      organizationId: user.organizationId,
      addedByUserId: user.id,
      title: "The Hobbit",
      authors: ["J.R.R. Tolkien"],
      description: "A fantasy novel about Bilbo Baggins.",
      summary: "Bilbo Baggins, a hobbit, is swept into an epic quest to reclaim the lost Kingdom of Erebor from the fearsome dragon Smaug. Joined by thirteen dwarves and the wizard Gandalf the Grey, Bilbo journeys through the Wild, facing goblins, wargs, and the creature Gollum, from whom he gains a magic ring.",
      subjectId: subject.id,
      externalSource: "MANUAL",
      extractionStatus: "EXTRACTED",
    }
  });

  console.log("Test book created!");
}

seedTestBook()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
