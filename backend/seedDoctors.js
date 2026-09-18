const { sequelize, User, Doctor, Slot } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
    await sequelize.sync();

    const doctorsData = [
        { name: 'Dr. Arjun Mehta', email: 'arjun.mehta@smartmed.app', specialization: 'Cardiologist', department: 'Cardiology', bio: 'Expert in heart diseases and surgical interventions.' },
        { name: 'Dr. Neha Gupta', email: 'neha.gupta@smartmed.app', specialization: 'Dermatologist', department: 'Dermatology', bio: 'Specialist in skin care, chronic skin conditions, and aesthetic procedures.' },
        { name: 'Dr. Rohan Desai', email: 'rohan.desai@smartmed.app', specialization: 'Orthopedist', department: 'Orthopedics', bio: 'Specializes in bone and joint disorders, sports injuries, and rehabilitation.' },
        { name: 'Dr. Priya Kapoor', email: 'priya.kapoor@smartmed.app', specialization: 'Pediatrician', department: 'Pediatrics', bio: 'Dedicated to child healthcare from infancy to adolescence.' },
        { name: 'Dr. Vikram Singh', email: 'vikram.singh@smartmed.app', specialization: 'General Physician', department: 'General Medicine', bio: 'Comprehensive healthcare and continuous care for adults.' },
    ];

    const passwordHash = await bcrypt.hash('Password123!', 10);

    for (const doc of doctorsData) {
        const existing = await User.findOne({ where: { email: doc.email } });
        if (existing) continue;

        console.log(`Creating doctor: ${doc.name}`);
        const user = await User.create({
            name: doc.name,
            email: doc.email,
            passwordHash,
            role: 'doctor'
        });

        const doctorProfile = await Doctor.create({
            userId: user.id,
            specialization: doc.specialization,
            department: doc.department,
            avgConsultMinutes: 15,
            bio: doc.bio
        });

        // Create 9 slots for today
        const date = new Date().toISOString().slice(0, 10);
        const slots = [];
        for (let i = 0; i < 9; i++) {
            slots.push({
                doctorId: doctorProfile.id,
                date,
                startTime: `${9 + i}:00`,
                endTime: `${10 + i}:00`,
                status: 'open'
            });
        }
        await Slot.bulkCreate(slots);
    }

    console.log('Seed completed successfully!');
}

seed().catch(console.error);
