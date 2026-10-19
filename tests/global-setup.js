// Se ejecuta UNA vez antes de todas las pruebas: crea la base smartudy_test con las mismas tablas.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8')
    .replace(/smartudy_db/g, 'smartudy_test');
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  await c.query(sql);
  await c.end();
};
