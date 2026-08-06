import { PrismaClient } from '@prisma/client';
import { SEED_USERS, SEED_WASTE_STREAMS, SEED_RESOURCE_NEEDS, SEED_MATCHES, SEED_PICKUP_JOBS, SEED_IMPACT_LOGS, SEED_NOTIFICATIONS } from '../src/utils/mockStore.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CircularSync AI database seed process...');

  try {
    // 1. Clean existing records in dependency order
    await prisma.notification.deleteMany({});
    await prisma.impactLog.deleteMany({});
    await prisma.pickupJob.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.forecastCache.deleteMany({});
    await prisma.resourceNeed.deleteMany({});
    await prisma.wasteStream.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Seed Users
    for (const u of SEED_USERS) {
      await prisma.user.create({ data: u });
    }
    console.log(`✅ Seeded ${SEED_USERS.length} users (8 producers, 6 consumers, 1 driver, 1 admin)`);

    // 3. Seed Waste Streams
    for (const ws of SEED_WASTE_STREAMS) {
      const { producer, ...wsData } = ws;
      await prisma.wasteStream.create({ data: wsData });
    }
    console.log(`✅ Seeded ${SEED_WASTE_STREAMS.length} waste streams`);

    // 4. Seed Resource Needs
    for (const rn of SEED_RESOURCE_NEEDS) {
      const { consumer, ...rnData } = rn;
      await prisma.resourceNeed.create({ data: rnData });
    }
    console.log(`✅ Seeded ${SEED_RESOURCE_NEEDS.length} resource needs`);

    // 5. Seed Matches
    for (const m of SEED_MATCHES) {
      const { wasteStream, resourceNeed, ...mData } = m;
      await prisma.match.create({ data: mData });
    }
    console.log(`✅ Seeded ${SEED_MATCHES.length} AI matches`);

    // 6. Seed Pickup Jobs
    for (const j of SEED_PICKUP_JOBS) {
      const { match, driver, ...jData } = j;
      await prisma.pickupJob.create({ data: jData });
    }
    console.log(`✅ Seeded ${SEED_PICKUP_JOBS.length} pickup jobs`);

    // 7. Seed Impact Logs
    for (const imp of SEED_IMPACT_LOGS) {
      const { match, ...impData } = imp;
      await prisma.impactLog.create({ data: impData });
    }
    console.log(`✅ Seeded ${SEED_IMPACT_LOGS.length} impact logs`);

    // 8. Seed Notifications
    for (const n of SEED_NOTIFICATIONS) {
      await prisma.notification.create({ data: n });
    }
    console.log(`✅ Seeded ${SEED_NOTIFICATIONS.length} notifications`);

    console.log('🎉 CircularSync AI database seeding completed cleanly!');
  } catch (error) {
    console.warn('Seed database warning (running in in-memory mode if DB not yet connected):', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
