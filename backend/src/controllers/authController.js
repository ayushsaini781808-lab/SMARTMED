const bcrypt = require('bcryptjs');
const { User, Doctor } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    let { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    // Support "any ID" by appending a dummy domain if it's not a valid email format
    if (!email.includes('@')) {
      email = `${email}@dummy.local`;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, phone, passwordHash,
      role: ['patient', 'doctor', 'admin'].includes(role) ? role : 'patient'
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken, refreshToken
    });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    let user;

    const { Op } = require('sequelize');

    // Support "any ID" by appending a dummy domain if it's not a valid email format
    if (!email.includes('@')) {
      user = await User.findOne({ where: { email: { [Op.like]: `${email}@%` } } });
      if (!user) {
        email = `${email}@dummy.local`;
      }
    }

    if (!user) {
      user = await User.findOne({ where: { email } });
    }

    // Automatically create user if they don't exist for easy testing
    if (!user) {
      const passwordHash = await bcrypt.hash(password || 'dummy', 10);
      user = await User.create({
        name: email.split('@')[0],
        email,
        passwordHash,
        role: 'patient'
      });
    }

    // Bypass password check
    // const ok = await bcrypt.compare(password, user.passwordHash);
    // if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, languagePref: user.languagePref },
      doctorProfile,
      accessToken, refreshToken
    });
  } catch (err) { next(err); }
}

// Google OAuth (FR-A3). Real flow verifies an id_token from Google's SDK on the
// frontend and looks up userinfo; here we accept a verified profile payload
// from the frontend's Google Identity Services callback for a working demo.
async function googleLogin(req, res, next) {
  try {
    const { googleId, email, name } = req.body;
    if (!googleId || !email) return res.status(400).json({ error: 'googleId and email required' });

    let user = await User.findOne({ where: { googleId } });
    if (!user) {
      user = await User.findOne({ where: { email } });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({ name: name || email.split('@')[0], email, googleId, role: 'patient' });
      }
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

async function logout(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) { user.refreshToken = null; await user.save(); }
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['passwordHash', 'refreshToken'] } });
    let doctorProfile = null;
    if (user.role === 'doctor') doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
    res.json({ user, doctorProfile });
  } catch (err) { next(err); }
}

async function setLanguage(req, res, next) {
  try {
    const { lang } = req.body;
    if (!['en', 'hi'].includes(lang)) return res.status(400).json({ error: 'lang must be en or hi' });
    const user = await User.findByPk(req.user.id);
    user.languagePref = lang;
    await user.save();
    res.json({ ok: true, languagePref: lang });
  } catch (err) { next(err); }
}

module.exports = { register, login, googleLogin, refresh, logout, me, setLanguage };
