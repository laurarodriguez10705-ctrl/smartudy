// Configura la aplicación (sin abrir puerto: así se podrá probar con Supertest).
require('dotenv').config();
if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el archivo .env');

const express = require('express');
const path = require('path');
const app = express();

app.set('trust proxy', 1); // Railway usa un proxy: así se detecta la IP real de cada usuario

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'))); // solo la carpeta public

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/datos'));
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada.' }));

app.use((err, req, res, next) => { // manejador central de errores
  console.error(err);
  res.status(500).json({ success: false, message: 'Error en el servidor.' });
});

module.exports = app;