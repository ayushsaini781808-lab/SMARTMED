/**
 * refreshSlots.js
 * Deletes ALL existing appointments + slots (which are stale) and regenerates
 * fresh slots for today -> today+7 for every doctor in the DB.
 * Does NOT touch User or Doctor records.
 * Run: node refreshSlots.js
 */
require('dotenv').config();
const { sequelize, Doctor, User, Slot } = require('./src/models');

const SLOT_TIMES = [
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

function getDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}

async function run() {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('Clearing stale data (FK-safe)...');
    // Disable FK constraints so we can delete in any order on SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    try { await sequelize.query('DELETE FROM waitlists'); } catch (e) { console.log('  waitlists skip:', e.message); }
    try { await sequelize.query('DELETE FROM appointments'); } catch (e) { console.log('  appointments skip:', e.message); }
    try { await sequelize.query('DELETE FROM slots'); } catch (e) { console.log('  slots skip:', e.message); }
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('   Done clearing.');

    const doctors = await Doctor.findAll({
        include: [{ model: User, as: 'user', attributes: ['name'] }]
    });
    console.log('Found ' + doctors.length + ' doctor(s) - generating fresh slots...');

    const allSlots = [];
    for (const doc of doctors) {
        for (let day = 0; day < 8; day++) {
            const date = getDateStr(day);
            for (const t of SLOT_TIMES) {
                allSlots.push({
                    doctorId: doc.id,
                    date,
                    startTime: t.start,
                    endTime: t.end,
                    capacity: 1,
                    bookedCount: 0,
                    status: 'open',
                });
            }
        }
        console.log('   OK: ' + doc.user.name + ' - 8 days x ' + SLOT_TIMES.length + ' slots');
    }

    await Slot.bulkCreate(allSlots);

    const today = getDateStr(0);
    console.log('\nDone! ' + allSlots.length + ' slots created (' + today + ' to ' + getDateStr(7) + ').');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
