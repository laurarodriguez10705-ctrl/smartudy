const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

let n = 0;
// Crea un usuario nuevo, inicia sesión y devuelve su token listo para usar.
async function nuevoUsuario(nombre = 'Test') {
  const email = `t${Date.now()}_${n++}@prueba.com`;
  const password = 'Clave123*';
  await request(app).post('/api/registro').send({ nombre, email, password });
  const r = await request(app).post('/api/login').send({ email, password });
  return { email, password, auth: { Authorization: `Bearer ${r.body.token}` } };
}
const limpiar = async () => { await db.query('DELETE FROM usuarios'); await db.query('DELETE FROM recordatorios'); };

module.exports = { request, app, db, nuevoUsuario, limpiar };
