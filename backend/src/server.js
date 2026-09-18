require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'smartmed-backend', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

// FR-C2: WebSocket rooms scoped per doctor+date so queue updates broadcast only
// to the patients/doctor who need them (< 100ms latency target).
io.on('connection', (socket) => {
  socket.on('queue:join', ({ doctorId, date }) => {
    if (doctorId && date) socket.join(`queue:${doctorId}:${date}`);
  });
  socket.on('queue:leave', ({ doctorId, date }) => {
    if (doctorId && date) socket.leave(`queue:${doctorId}:${date}`);
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // dev convenience; use migrations in production
    console.log('Database connected and synced.');
    server.listen(PORT, () => console.log(`SmartMed backend listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
