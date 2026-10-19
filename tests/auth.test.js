const { request, app, db, limpiar } = require('./helpers');

const u = { nombre: 'Laura', email: 'laura@prueba.com', password: 'Clave123*' };
beforeAll(limpiar);
afterAll(async () => { await limpiar(); await db.end(); });

describe('Registro', () => {
  it('crea un usuario nuevo (201)', async () => {
    const r = await request(app).post('/api/registro').send(u);
    expect(r.statusCode).toBe(201);
    expect(r.body.success).toBe(true);
  });
  it('guarda la contraseña encriptada, no en texto plano', async () => {
    const [rows] = await db.query('SELECT password FROM usuarios WHERE email = ?', [u.email]);
    expect(rows[0].password).not.toBe(u.password);
    expect(rows[0].password.startsWith('$2')).toBe(true);
  });
  it('rechaza un correo repetido (409)', async () => {
    expect((await request(app).post('/api/registro').send(u)).statusCode).toBe(409);
  });
  it('rechaza campos vacíos (400)', async () => {
    expect((await request(app).post('/api/registro').send({ email: 'a@b.com' })).statusCode).toBe(400);
  });
  it('rechaza un correo con formato inválido (400)', async () => {
    expect((await request(app).post('/api/registro').send({ ...u, email: 'no-es-correo' })).statusCode).toBe(400);
  });
  it('rechaza una contraseña de menos de 6 caracteres (400)', async () => {
    expect((await request(app).post('/api/registro').send({ ...u, email: 'x@y.com', password: '123' })).statusCode).toBe(400);
  });
});

describe('Login', () => {
  it('con datos correctos devuelve token y usuario', async () => {
    const r = await request(app).post('/api/login').send({ email: u.email, password: u.password });
    expect(r.statusCode).toBe(200);
    expect(r.body.token).toBeDefined();
    expect(r.body.usuario.email).toBe(u.email);
  });
  it('NO devuelve el hash de la contraseña', async () => {
    const r = await request(app).post('/api/login').send({ email: u.email, password: u.password });
    expect(r.body.usuario.password).toBeUndefined();
  });
  it('contraseña incorrecta (401)', async () => {
    expect((await request(app).post('/api/login').send({ email: u.email, password: 'mala' })).statusCode).toBe(401);
  });
  it('correo no registrado (404, code NOT_REGISTERED)', async () => {
    const r = await request(app).post('/api/login').send({ email: 'nadie@prueba.com', password: 'x' });
    expect(r.statusCode).toBe(404);
    expect(r.body.code).toBe('NOT_REGISTERED');
  });
  it('campos vacíos (400)', async () => {
    expect((await request(app).post('/api/login').send({})).statusCode).toBe(400);
  });
});

describe('Protección de rutas', () => {
  it.each(['tareas', 'horarios', 'recordatorios'])('/api/%s sin token responde 401', async (ruta) => {
    expect((await request(app).get('/api/' + ruta)).statusCode).toBe(401);
  });
  it('con un token falso responde 403', async () => {
    const r = await request(app).get('/api/tareas').set('Authorization', 'Bearer token.falso.123');
    expect(r.statusCode).toBe(403);
  });
  it('el servidor no expone el archivo .env', async () => {
    const r = await request(app).get('/.env');
    expect(r.text || '').not.toMatch(/JWT_SECRET|DB_PASSWORD/);
  });
});
