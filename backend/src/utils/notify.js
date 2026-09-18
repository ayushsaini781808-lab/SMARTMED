const nodemailer = require('nodemailer');

// Uses nodemailer's built-in JSON transport so the demo runs with zero external
// credentials. Swap to a real SMTP/Twilio transport for production by changing
// only this file - callers are unaffected.
const transporter = nodemailer.createTransport({ jsonTransport: true });

const log = []; // in-memory notification log surfaced to Admin > Notification Log

async function sendEmail(to, subject, text) {
  const info = await transporter.sendMail({ from: 'no-reply@smartmed.app', to, subject, text });
  log.push({ channel: 'email', to, subject, text, at: new Date().toISOString() });
  return info;
}

async function sendSms(to, text) {
  // Twilio/WhatsApp stub - logs instead of sending (free-tier/demo constraint from PRD).
  log.push({ channel: 'sms_whatsapp', to, text, at: new Date().toISOString() });
  return { simulated: true };
}

function getLog() {
  return log.slice(-200).reverse();
}

module.exports = { sendEmail, sendSms, getLog };
