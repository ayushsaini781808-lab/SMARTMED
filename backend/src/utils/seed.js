require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Doctor, Slot } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await User.create({ name: 'Hospital Admin', email: 'admin@smartmed.app', passwordHash, role: 'admin' });

  const doctorSeeds = [
    { name: 'Dr. Anjali Sharma', email: 'anjali.sharma@smartmed.app', specialization: 'Neurologist', department: 'Neurology' },
    { name: 'Dr. Rohan Verma', email: 'rohan.verma@smartmed.app', specialization: 'Cardiologist', department: 'Cardiology' },
    { name: 'Dr. Priya Nair', email: 'priya.nair@smartmed.app', specialization: 'General Physician', department: 'General Medicine' },
    { name: 'Dr. Karan Mehta', email: 'karan.mehta@smartmed.app', specialization: 'Orthopedic', department: 'Orthopedics' },
    { name: 'Dr. Sneha Iyer', email: 'sneha.iyer@smartmed.app', specialization: 'Pediatrician', department: 'Pediatrics' }
  ];

  const today = new Date().toISOString().slice(0, 10);

  for (const d of doctorSeeds) {
    const user = await User.create({ name: d.name, email: d.email, passwordHash, role: 'doctor' });
    const doctor = await Doctor.create({
      userId: user.id, specialization: d.specialization, department: d.department, avgConsultMinutes: 12
    });

    // Generate today's slots 09:00-13:00, 15 min each.
    let h = 9, m = 0;
    while (h < 13) {
      const sStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      m += 15;
      if (m >= 60) { m -= 60; h += 1; }
      const eStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      await Slot.create({ doctorId: doctor.id, date: today, startTime: sStr, endTime: eStr, capacity: 1 });
    }
  }

  const patient = await User.create({ name: 'Test Patient', email: 'patient@smartmed.app', passwordHash, role: 'patient' });

  console.log('\nSeed complete. Demo accounts (password for all: Password123!):');
  console.log('  Admin:   admin@smartmed.app');
  console.log('  Doctor:  anjali.sharma@smartmed.app (Neurologist)');
  console.log('  Doctor:  rohan.verma@smartmed.app (Cardiologist)');
  console.log('  Patient: patient@smartmed.app');
  console.log(`\nToday's slots (${today}) generated for all 5 doctors, 09:00-13:00.\n`);

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
