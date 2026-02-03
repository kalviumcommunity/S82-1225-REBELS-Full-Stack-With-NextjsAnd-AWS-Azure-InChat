import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await prisma.message.deleteMany({});
  await prisma.chatParticipant.deleteMany({});
  await prisma.directChat.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  // NOTE: All test users use password: "password"
  const testPasswordHash = await bcrypt.hash('password', 10);
  
  const alice = await prisma.user.create({
    data: {
      email: 'bhavindrakumaryarramalla@gmail.com',
      displayName: 'Bhavi',
      passwordHash: testPasswordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'orangebro1626@gmail.com',
      displayName: 'Shiva Keshav',
      passwordHash: testPasswordHash,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: 'kokkubro28@gmail.com',
      displayName: 'Dhanush',
      passwordHash: testPasswordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'shivakeshavgoud@gmail.com',
      displayName: 'Shiva',
      passwordHash: testPasswordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'dhanushkokku28@gmail.com',
      displayName: 'Dhanush',
      passwordHash: testPasswordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'bhavendrakumar007@gmail.com',
      displayName: 'Bhavendra',
      passwordHash: testPasswordHash,
    },
  });

  console.log('Created 6 users');

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
        content: 'Hey Kokku! Welcome to Inchat.',
      },
      {
        chatId: chat.id,
        senderId: bob.id,
        content: 'Hey Bhavi! This feels like WhatsApp already 👀',
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
  console.log('  - Users: 6');
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
