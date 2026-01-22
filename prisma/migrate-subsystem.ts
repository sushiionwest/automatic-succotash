import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map known subsystem values to team slugs
const SUBSYSTEM_TO_TEAM: Record<string, string> = {
    // Exact matches
    "electronics": "electronics-team",
    "electronics team": "electronics-team",
    "aero": "aerodynamics-team",
    "aerodynamics": "aerodynamics-team",
    "aerodynamics team": "aerodynamics-team",
    "controls": "controls-team",
    "controls team": "controls-team",
    "wings": "wings-25-26",
    "wings team": "wings-25-26",
    "wings 25-26": "wings-25-26",
    "fuselage": "fuselage-25-26",
    "fuselage team": "fuselage-25-26",
    "fuselage 25-26": "fuselage-25-26",
    "cfd": "cfd-25-26",
    "cfd team": "cfd-25-26",
    "cfd 25-26": "cfd-25-26",
    "landing gear": "landing-gear-25-26",
    "landing gear team": "landing-gear-25-26",
    "landing gear 25-26": "landing-gear-25-26",
    // Common variations
    "structures": "fuselage-25-26",
    "propulsion": "electronics-team",
    "avionics": "electronics-team",
};

function normalizeSubsystem(subsystem: string): string {
    return subsystem.trim().toLowerCase();
}

async function main() {
    console.log("Starting subsystem → teamId migration...\n");

    // Get all teams for lookup
    const teams = await prisma.team.findMany();
    const teamsBySlug = new Map(teams.map(t => [t.slug, t]));

    console.log(`Found ${teams.length} teams:\n`);
    teams.forEach(t => console.log(`  - ${t.name} (${t.slug})`));
    console.log();

    // Find cards with subsystem but no teamId
    const cardsToMigrate = await prisma.card.findMany({
        where: {
            teamId: null,
            subsystem: { not: null },
        },
        select: {
            id: true,
            title: true,
            subsystem: true,
        },
    });

    console.log(`Found ${cardsToMigrate.length} cards to migrate\n`);

    if (cardsToMigrate.length === 0) {
        console.log("Nothing to migrate!");
        return;
    }

    let migrated = 0;
    let skipped = 0;
    const unmapped: string[] = [];

    for (const card of cardsToMigrate) {
        const normalized = normalizeSubsystem(card.subsystem!);
        const teamSlug = SUBSYSTEM_TO_TEAM[normalized];

        if (!teamSlug) {
            console.log(`  SKIP: "${card.subsystem}" - no mapping found`);
            unmapped.push(card.subsystem!);
            skipped++;
            continue;
        }

        const team = teamsBySlug.get(teamSlug);
        if (!team) {
            console.log(`  SKIP: "${card.subsystem}" - team slug "${teamSlug}" not found`);
            skipped++;
            continue;
        }

        await prisma.card.update({
            where: { id: card.id },
            data: { teamId: team.id },
        });

        console.log(`  OK: "${card.title}" → ${team.name}`);
        migrated++;
    }

    console.log(`\n--- Migration complete ---`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped:  ${skipped}`);

    if (unmapped.length > 0) {
        const unique = [...new Set(unmapped)];
        console.log(`\nUnmapped subsystem values:`);
        unique.forEach(s => console.log(`  - "${s}"`));
        console.log(`\nAdd these to SUBSYSTEM_TO_TEAM mapping and re-run.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
