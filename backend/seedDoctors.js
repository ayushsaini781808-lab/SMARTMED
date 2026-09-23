const { sequelize, User, Doctor, Slot } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
    await sequelize.sync();

    const doctorsData = [
        {
            name: 'Dr. Anjali Sharma',
            email: 'anjali.sharma@smartmed.app',
            specialization: 'Neurologist',
            department: 'Neurology',
            bio: '15 years of experience in epilepsy, migraines, and neurodegenerative disorders. Fellow of the Indian Academy of Neurology.'
        },
        {
            name: 'Dr. Arjun Mehta',
            email: 'arjun.mehta@smartmed.app',
            specialization: 'Cardiologist',
            department: 'Cardiology',
            bio: 'Interventional cardiologist specialising in heart failure, coronary artery disease, and preventive cardiac care.'
        },
        {
            name: 'Dr. Neha Gupta',
            email: 'neha.gupta@smartmed.app',
            specialization: 'Dermatologist',
            department: 'Dermatology',
            bio: 'Expert in chronic skin disorders, acne, psoriasis, and cosmetic dermatology. Over 10 years in clinical practice.'
        },
        {
            name: 'Dr. Rohan Desai',
            email: 'rohan.desai@smartmed.app',
            specialization: 'Orthopedist',
            department: 'Orthopedics',
            bio: 'Sports medicine and joint replacement specialist. Has treated multiple national-level athletes.'
        },
        {
            name: 'Dr. Priya Kapoor',
            email: 'priya.kapoor@smartmed.app',
            specialization: 'Pediatrician',
            department: 'Pediatrics',
            bio: 'Compassionate child health specialist with expertise in developmental disorders, vaccinations, and nutrition.'
        },
        {
            name: 'Dr. Vikram Singh',
            email: 'vikram.singh@smartmed.app',
            specialization: 'General Physician',
            department: 'General Medicine',
            bio: 'Comprehensive primary care for adults. Focus on chronic disease management and preventive health.'
        },
        {
            name: 'Dr. Meera Nair',
            email: 'meera.nair@smartmed.app',
            specialization: 'Gynaecologist',
            department: 'Gynaecology',
            bio: 'Women\'s health specialist with expertise in reproductive health, prenatal care, and minimally invasive surgery.'
        },
        {
            name: 'Dr. Sahil Bose',
            email: 'sahil.bose@smartmed.app',
            specialization: 'Psychiatrist',
            department: 'Psychiatry',
            bio: 'Mental health specialist focusing on anxiety, depression, PTSD, and evidence-based therapy approaches.'
        },
        {
            name: 'Dr. Kavitha Rao',
            email: 'kavitha.rao@smartmed.app',
            specialization: 'Ophthalmologist',
            department: 'Ophthalmology',
            bio: 'Eye care expert specialising in cataract surgery, glaucoma management, and refractive disorders.'
        },
        {
            name: 'Dr. Aditya Joshi',
            email: 'aditya.joshi@smartmed.app',
            specialization: 'Gastroenterologist',
            department: 'Gastroenterology',
            bio: 'Digestive health specialist with experience in endoscopy, IBD, and liver disease management.'
        },
        {
            name: 'Dr. Sunita Pillai',
            email: 'sunita.pillai@smartmed.app',
            specialization: 'Endocrinologist',
            department: 'Endocrinology',
            bio: 'Diabetes and thyroid specialist with 12 years in metabolic disease management and hormone disorders.'
        },
        {
            name: 'Dr. Rahul Chatterjee',
            email: 'rahul.chatterjee@smartmed.app',
            specialization: 'Pulmonologist',
            department: 'Pulmonology',
            bio: 'Respiratory medicine expert treating asthma, COPD, sleep apnoea, and obstructive lung diseases.'
        },
        {
            name: 'Dr. Divya Menon',
            email: 'divya.menon@smartmed.app',
            specialization: 'ENT Specialist',
            department: 'ENT',
            bio: 'Ear, nose, and throat specialist treating sinusitis, hearing loss, tonsillitis, and head-and-neck disorders.'
        },
        {
            name: 'Dr. Karan Malhotra',
            email: 'karan.malhotra@smartmed.app',
            specialization: 'Urologist',
            department: 'Urology',
            bio: 'Uro-oncology and kidney stone specialist with expertise in minimally invasive urological procedures.'
        },
        {
            name: 'Dr. Pooja Verma',
            email: 'pooja.verma@smartmed.app',
            specialization: 'Rheumatologist',
            department: 'Rheumatology',
            bio: 'Specialises in arthritis, autoimmune diseases, and musculoskeletal disorders. Trained at AIIMS Delhi.'
        }
    ];

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Generate today + next 6 days for slots
    function getDateStr(offsetDays) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().slice(0, 10);
    }

    const slotTimes = [
        { start: '09:00', end: '09:30' },
        { start: '09:30', end: '10:00' },
        { start: '10:00', end: '10:30' },
        { start: '10:30', end: '11:00' },
        { start: '11:00', end: '11:30' },
        { start: '11:30', end: '12:00' },
        { start: '14:00', end: '14:30' },
        { start: '14:30', end: '15:00' },
        { start: '15:00', end: '15:30' },
        { start: '15:30', end: '16:00' },
        { start: '16:00', end: '16:30' },
        { start: '16:30', end: '17:00' },
    ];

    for (const doc of doctorsData) {
        const existing = await User.findOne({ where: { email: doc.email } });
        if (existing) {
            console.log(`Skipping (already exists): ${doc.name}`);
            continue;
        }

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

        // Create slots for today + next 6 days
        const allSlots = [];
        for (let day = 0; day < 7; day++) {
            const date = getDateStr(day);
            for (const t of slotTimes) {
                allSlots.push({
                    doctorId: doctorProfile.id,
                    date,
                    startTime: t.start,
                    endTime: t.end,
                    status: 'open'
                });
            }
        }
        await Slot.bulkCreate(allSlots);
    }

    console.log('✅ Seed completed successfully! 15 doctors created with 7-day slots.');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
