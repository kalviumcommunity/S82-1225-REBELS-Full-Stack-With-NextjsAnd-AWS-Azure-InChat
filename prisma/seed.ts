import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await prisma.message.deleteMany({});
  await prisma.chatParticipant.deleteMany({});
  await prisma.directChat.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  // NOTE: These are demo hashes. In app code we hash with bcrypt.
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      displayName: 'Alice',
      passwordHash: '$2a$10$8S8K8S8K8S8K8S8K8S8K8u2bGm4VvGQe3r0H2y3Qq8WJm3Qm3q6mK',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      displayName: 'Bob',
      passwordHash: '$2a$10$8S8K8S8K8S8K8S8K8S8K8u2bGm4VvGQe3r0H2y3Qq8WJm3Qm3q6mK',
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      displayName: 'Charlie',
      passwordHash: '$2a$10$8S8K8S8K8S8K8S8K8S8K8u2bGm4VvGQe3r0H2y3Qq8WJm3Qm3q6mK',
    },
  });

  console.log('Created 3 users');

  // Create a direct chat between Alice and Bob
  const user1Id = alice.id < bob.id ? alice.id : bob.id;
  const user2Id = alice.id < bob.id ? bob.id : alice.id;

  const chat = await prisma.chat.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
      direct: {
        create: {
          user1Id,
          user2Id,
        },
      },
    },
    include: { participants: true },
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        senderId: alice.id,
        content: 'Hey Bob! Welcome to Inchat.',
      },
      {
        chatId: chat.id,
        senderId: bob.id,
        content: 'Hey Alice! This feels like WhatsApp already 👀',
      },
    ],
  });

  // Another direct chat (Bob <-> Charlie)
  const userAId = bob.id < charlie.id ? bob.id : charlie.id;
  const userBId = bob.id < charlie.id ? charlie.id : bob.id;

  const chat2 = await prisma.chat.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [{ userId: bob.id }, { userId: charlie.id }],
      },
      direct: {
        create: {
          user1Id: userAId,
          user2Id: userBId,
        },
      },
    },
  });

  await prisma.message.create({
    data: {
      chatId: chat2.id,
      senderId: charlie.id,
      content: 'Yo Bob — test message!',
    },
  });

  console.log('✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - Users: 3');
  console.log('  - Chats: 2');
  console.log('  - Messages: 3');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
