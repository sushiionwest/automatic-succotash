import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// SAE teams matching Discord structure
const SAE_TEAMS = [
    { name: "Electronics Team", slug: "electronics-team", discordChannel: "#electronics-team" },
    { name: "Aerodynamics Team", slug: "aerodynamics-team", discordChannel: "#aerodynamics-team" },
    { name: "Controls Team", slug: "controls-team", discordChannel: "#controls-team" },
    { name: "Wings Team 25-26", slug: "wings-25-26", discordChannel: "#wings-team-25-26" },
    { name: "Fuselage Team 25-26", slug: "fuselage-25-26", discordChannel: "#fuselage-team-25-26" },
    { name: "CFD Team 25-26", slug: "cfd-25-26", discordChannel: "#cfd-team-25-26" },
    { name: "Landing Gear Team 25-26", slug: "landing-gear-25-26", discordChannel: "#landing-gear-team-25-26" },
];

async function main() {
    console.log("Seeding teams...");

    for (const team of SAE_TEAMS) {
        const existing = await prisma.team.findUnique({
            where: { slug: team.slug },
        });

        if (existing) {
            console.log(`  Team "${team.name}" already exists, skipping`);
            continue;
        }

        await prisma.team.create({ data: team });
        console.log(`  Created team: ${team.name}`);
    }

    console.log("Done!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
