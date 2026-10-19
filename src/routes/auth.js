const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');
const wrap = require('../middlewares/wrap');

// Máximo 20 intentos por IP cada 15 minutos (frena adivinar contraseñas)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  message: { success: false, message: 'Demasiados intentos. Espera 15 minutos.' }
});
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v) => String(v || '').trim();

router.post('/registro', limiter, wrap(async (req, res) => {
  const nombre = texto(req.body.nombre);
  const email = texto(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  if (!nombre || !email || !password) return res.status(400).json({ success: false, message: 'Completa todos los campos.' });
  if (!EMAIL.test(email)) return res.status(400).json({ success: false, message: 'El correo no es válido.' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, hash]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Este correo ya está registrado.' });
    throw e;
  }
  res.status(201).json({ success: true, message: '¡Registro exitoso!' });
}));

router.post('/login', limiter, wrap(async (req, res) => {
  const email = texto(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ success: false, message: 'Por favor completa todos los campos.' });

  const [rows] = await db.query('SELECT id, nombre, email, password FROM usuarios WHERE email = ?', [email]);
  if (!rows.length) {
    return res.status(404).json({ success: false, code: 'NOT_REGISTERED', message: 'Este correo no está registrado.' });
  }
  const u = rows[0];
  if (!(await bcrypt.compare(password, u.password))) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }
  // El token identifica al usuario en cada petición; ya no se envía el hash de la contraseña
  const token = jwt.sign({ id: u.id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, message: '¡Usuario correcto!', token, usuario: { id: u.id, nombre: u.nombre, email: u.email } });
}));

module.exports = router;
