// Tareas, horarios y recordatorios. El usuario sale SIEMPRE del token, nunca de lo que envíe el navegador.
const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middlewares/auth');
const wrap = require('../middlewares/wrap');

router.use(['/tareas', '/horarios', '/recordatorios'], auth);

const texto = (v) => String(v || '').trim();
const noEncontrado = (res) => res.status(404).json({ success: false, message: 'No encontrado.' });
// Borra solo si el registro pertenece al usuario del token
const borrar = (tabla, campo, clave) => wrap(async (req, res) => {
  const [r] = await db.query(`DELETE FROM ${tabla} WHERE id = ? AND ${campo} = ?`, [req.params.id, req.usuario[clave]]);
  if (!r.affectedRows) return noEncontrado(res);
  res.json({ success: true, message: 'Eliminado.' });
});

// ---- TAREAS ----
router.get('/tareas', wrap(async (req, res) => {
  const [tareas] = await db.query('SELECT * FROM tareas WHERE usuario_id = ? ORDER BY id DESC', [req.usuario.id]);
  res.json({ success: true, tareas });
}));
router.post('/tareas', wrap(async (req, res) => {
  const titulo = texto(req.body.titulo).slice(0, 200);
if (!titulo) return res.status(400).json({ success: false, message: 'El título es obligatorio.' });
  const [r] = await db.query('INSERT INTO tareas (titulo, descripcion, completada, usuario_id) VALUES (?, ?, 0, ?)',
    [titulo, texto(req.body.descripcion), req.usuario.id]);
  res.status(201).json({ success: true, message: '¡Tarea creada con éxito!', tareaId: r.insertId });
}));
router.put('/tareas/:id', wrap(async (req, res) => {
  const [r] = await db.query('UPDATE tareas SET completada = ? WHERE id = ? AND usuario_id = ?',
    [req.body.completada ? 1 : 0, req.params.id, req.usuario.id]);
  if (!r.affectedRows) return noEncontrado(res);
  res.json({ success: true, message: '¡Estado de la tarea actualizado!' });
}));
router.delete('/tareas/:id', borrar('tareas', 'usuario_id', 'id'));

// ---- HORARIOS ----
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
router.get('/horarios', wrap(async (req, res) => {
  const [horarios] = await db.query(
    'SELECT * FROM horarios WHERE usuario_id = ? ORDER BY FIELD(dia_semana, ?), hora_inicio', [req.usuario.id, DIAS]);
  res.json({ success: true, horarios });
}));
router.post('/horarios', wrap(async (req, res) => {
  const { dia_semana, hora_inicio, hora_fin } = req.body;
  const titulo = texto(req.body.titulo).slice(0, 200);
  if (!titulo || !hora_inicio || !hora_fin || !DIAS.includes(dia_semana)) {
    return res.status(400).json({ success: false, message: 'Completa los campos obligatorios del horario.' });
  }
  if (hora_fin <= hora_inicio) return res.status(400).json({ success: false, message: 'La hora de fin debe ser posterior a la de inicio.' });
  const [r] = await db.query(
    'INSERT INTO horarios (usuario_id, titulo, tipo, dia_semana, hora_inicio, hora_fin, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.usuario.id, titulo, texto(req.body.tipo) || 'Clase', dia_semana, hora_inicio, hora_fin, texto(req.body.descripcion)]);
  res.status(201).json({ success: true, message: '¡Horario agregado con éxito!', horarioId: r.insertId });
}));
router.delete('/horarios/:id', borrar('horarios', 'usuario_id', 'id'));

// ---- RECORDATORIOS (se guardan por correo, como en el esquema original) ----
router.get('/recordatorios', wrap(async (req, res) => {
  const [recordatorios] = await db.query(
    'SELECT * FROM recordatorios WHERE usuario_email = ? ORDER BY fecha_recordatorio ASC', [req.usuario.email]);
  res.json({ success: true, recordatorios });
}));
router.post('/recordatorios', wrap(async (req, res) => {
  const { fecha, hora } = req.body;
  const asignatura = texto(req.body.asignatura).slice(0, 100);
  const titulo = texto(req.body.titulo).slice(0, 200);
  if (!asignatura || !titulo || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')) {
    return res.status(400).json({ success: false, message: 'Por favor completa todos los campos.' });
  }
  await db.query('INSERT INTO recordatorios (usuario_email, asignatura, titulo, fecha_recordatorio) VALUES (?, ?, ?, ?)',
    [req.usuario.email, asignatura, titulo, `${fecha} ${hora}:00`]);
  res.status(201).json({ success: true, message: '¡Guardado con éxito!' });
}));
router.delete('/recordatorios/:id', borrar('recordatorios', 'usuario_email', 'email'));

module.exports = router;
