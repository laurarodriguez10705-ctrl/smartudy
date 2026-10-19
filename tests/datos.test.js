const { request, app, db, nuevoUsuario, limpiar } = require('./helpers');

let A, B;
beforeAll(async () => { await limpiar(); A = await nuevoUsuario('Ana'); B = await nuevoUsuario('Beto'); });
afterAll(async () => { await limpiar(); await db.end(); });

describe('Tareas', () => {
  let id;
  it('crea una tarea (201)', async () => {
    const r = await request(app).post('/api/tareas').set(A.auth).send({ titulo: 'Estudiar álgebra' });
    expect(r.statusCode).toBe(201);
    id = r.body.tareaId;
  });
  it('rechaza una tarea sin título (400)', async () => {
    expect((await request(app).post('/api/tareas').set(A.auth).send({})).statusCode).toBe(400);
  });
  it('la lista del dueño incluye la tarea', async () => {
    const r = await request(app).get('/api/tareas').set(A.auth);
    expect(r.body.tareas.map((t) => t.titulo)).toContain('Estudiar álgebra');
  });
  it('se puede marcar como completada', async () => {
    expect((await request(app).put('/api/tareas/' + id).set(A.auth).send({ completada: true })).statusCode).toBe(200);
    const r = await request(app).get('/api/tareas').set(A.auth);
    expect(r.body.tareas.find((t) => t.id === id).completada).toBe(1);
  });
  it('otro usuario NO ve la tarea', async () => {
    const r = await request(app).get('/api/tareas').set(B.auth);
    expect(r.body.tareas).toHaveLength(0);
  });
  it('otro usuario NO puede editarla ni borrarla (404)', async () => {
    expect((await request(app).put('/api/tareas/' + id).set(B.auth).send({ completada: false })).statusCode).toBe(404);
    expect((await request(app).delete('/api/tareas/' + id).set(B.auth)).statusCode).toBe(404);
  });
  it('el dueño sí puede borrarla', async () => {
    expect((await request(app).delete('/api/tareas/' + id).set(A.auth)).statusCode).toBe(200);
  });
  it('un intento de inyección SQL se guarda como texto, sin romper nada', async () => {
    const t = "x'; DROP TABLE tareas; --";
    expect((await request(app).post('/api/tareas').set(A.auth).send({ titulo: t })).statusCode).toBe(201);
    const r = await request(app).get('/api/tareas').set(A.auth);
    expect(r.body.tareas[0].titulo).toBe(t);
  });
});

describe('Horarios', () => {
  const h = { titulo: 'Bases de datos', dia_semana: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' };
  let id;
  it('crea un horario (201)', async () => {
    const r = await request(app).post('/api/horarios').set(A.auth).send(h);
    expect(r.statusCode).toBe(201);
    id = r.body.horarioId;
  });
  it('rechaza un día inválido (400)', async () => {
    expect((await request(app).post('/api/horarios').set(A.auth).send({ ...h, dia_semana: 'Funday' })).statusCode).toBe(400);
  });
  it('rechaza hora de fin anterior a la de inicio (400)', async () => {
    expect((await request(app).post('/api/horarios').set(A.auth).send({ ...h, hora_inicio: '10:00', hora_fin: '08:00' })).statusCode).toBe(400);
  });
  it('lista solo los horarios propios', async () => {
    expect((await request(app).get('/api/horarios').set(A.auth)).body.horarios).toHaveLength(1);
    expect((await request(app).get('/api/horarios').set(B.auth)).body.horarios).toHaveLength(0);
  });
  it('otro usuario no puede borrarlo (404) y el dueño sí (200)', async () => {
    expect((await request(app).delete('/api/horarios/' + id).set(B.auth)).statusCode).toBe(404);
    expect((await request(app).delete('/api/horarios/' + id).set(A.auth)).statusCode).toBe(200);
  });
});

describe('Recordatorios', () => {
  const r0 = { asignatura: 'Cálculo', titulo: 'Parcial', fecha: '2026-11-20', hora: '07:30' };
  let id;
  it('crea un recordatorio (201)', async () => {
    expect((await request(app).post('/api/recordatorios').set(A.auth).send(r0)).statusCode).toBe(201);
  });
  it('rechaza una fecha con formato inválido (400)', async () => {
    expect((await request(app).post('/api/recordatorios').set(A.auth).send({ ...r0, fecha: '20/11/2026' })).statusCode).toBe(400);
  });
  it('lo ve el dueño y no otro usuario', async () => {
    const a = await request(app).get('/api/recordatorios').set(A.auth);
    expect(a.body.recordatorios).toHaveLength(1);
    id = a.body.recordatorios[0].id;
    expect((await request(app).get('/api/recordatorios').set(B.auth)).body.recordatorios).toHaveLength(0);
  });
  it('otro usuario no puede borrarlo (404) y el dueño sí (200)', async () => {
    expect((await request(app).delete('/api/recordatorios/' + id).set(B.auth)).statusCode).toBe(404);
    expect((await request(app).delete('/api/recordatorios/' + id).set(A.auth)).statusCode).toBe(200);
  });
});
