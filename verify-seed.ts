
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.resourceKind.count();
    const visualCount = await prisma.resourceKind.count({
        where: { requiresVision: true },
    });

    console.log(`Total ResourceKinds: ${total}`);
    console.log(`Visual ResourceKinds: ${visualCount}`);

    const examples = await prisma.resourceKind.findMany({
        where: { requiresVision: true },
        take: 5,
        select: { label: true, requiresVision: true },
    });

    console.log("Examples of Visual ResourceKinds:");
    examples.forEach((k) => console.log(`- ${k.label}`));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
