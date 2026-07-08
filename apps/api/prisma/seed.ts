import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const statuses: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
];

async function main() {
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();

  for (let i = 0; i < 10; i++) {
    const candidate = await prisma.candidate.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }) ?? null,
        location:
          faker.helpers.maybe(() => `${faker.location.city()}, ${faker.location.country()}`, {
            probability: 0.8,
          }) ?? null,
        linkedinUrl:
          faker.helpers.maybe(() => `https://linkedin.com/in/${faker.internet.userName()}`, {
            probability: 0.6,
          }) ?? null,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) ?? null,
      },
    });

    const appCount = faker.number.int({ min: 2, max: 4 });
    for (let j = 0; j < appCount; j++) {
      await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobTitle: faker.person.jobTitle(),
          company: faker.company.name(),
          status: faker.helpers.arrayElement(statuses),
          appliedAt: faker.date.recent({ days: 56 }),
          salaryExpectation:
            faker.helpers.maybe(() => faker.number.int({ min: 40000, max: 180000 }), {
              probability: 0.6,
            }) ?? null,
          source:
            faker.helpers.maybe(
              () => faker.helpers.arrayElement(['LinkedIn', 'Referral', 'Company website', 'Indeed', 'Job fair']),
              { probability: 0.7 }
            ) ?? null,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
        },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });