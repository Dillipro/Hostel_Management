/* Seed blocks, rooms, and test users */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const rcPass = await bcrypt.hash('rc12345', 10);
  const studentPass = await bcrypt.hash('stud1234', 10);
  const wardenPass = await bcrypt.hash('warden123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin', phone: '9000000001', role: 'admin', password_hash: adminPass }
  });

  const boysAmbal = await prisma.hostelBlock.upsert({
    where: { id: 'seed-boys-ambal' },
    update: {},
    create: { id: 'seed-boys-ambal', name: 'Ambal', type: 'boys', category: 'Ambal', capacity: 100 }
  });
  const girlsMarutham = await prisma.hostelBlock.upsert({
    where: { id: 'seed-girls-marutham' },
    update: {},
    create: { id: 'seed-girls-marutham', name: 'Marutham', type: 'girls', category: 'Marutham', capacity: 100 }
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.room.upsert({
      where: { id: `seed-room-${boysAmbal.id}-${i}` },
      update: {},
      create: { id: `seed-room-${boysAmbal.id}-${i}`, hostel_block_id: boysAmbal.id, room_no: `A-${i}`, floor: 1, capacity: 3, occupied_count: 0, availability: 'available' }
    });
    await prisma.room.upsert({
      where: { id: `seed-room-${girlsMarutham.id}-${i}` },
      update: {},
      create: { id: `seed-room-${girlsMarutham.id}-${i}`, hostel_block_id: girlsMarutham.id, room_no: `M-${i}`, floor: 1, capacity: 3, occupied_count: 0, availability: 'available' }
    });
  }

  const rcUser = await prisma.user.upsert({
    where: { email: 'rc@example.com' },
    update: {},
    create: { email: 'rc@example.com', name: 'RC User', phone: '9000000002', role: 'rc', password_hash: rcPass }
  });
  await prisma.rCAssignment.create({ data: { block_id: boysAmbal.id, rc_id: rcUser.id, start_date: new Date() } });

  const warden = await prisma.user.upsert({
    where: { email: 'warden@example.com' },
    update: {},
    create: { email: 'warden@example.com', name: 'Warden User', phone: '9000000004', role: 'warden', password_hash: wardenPass }
  });
  // Assign warden to the Ambal block
  await prisma.hostelBlock.update({ where: { id: boysAmbal.id }, data: { warden_id: warden.id } });

  const student = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: { email: 'student1@example.com', name: 'Student One', phone: '9000000003', role: 'student', password_hash: studentPass }
  });
  await prisma.student.upsert({
    where: { user_id: student.id },
    update: {},
    create: { user_id: student.id, hostel_id: boysAmbal.id }
  });

  console.log('Seed completed');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
