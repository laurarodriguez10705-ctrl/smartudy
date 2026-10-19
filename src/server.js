// Punto de arranque: comprueba la base de datos y abre el puerto.
const app = require('./app');
const db = require('./config/db');
const PORT = process.env.PORT || 4000;

db.query('SELECT 1')
  .then(() => console.log('✅ ¡Conectado exitosamente a la base de datos de XAMPP (MySQL)!'))
  .catch((e) => console.error('❌ Error al conectar a la base de datos:', e.message));

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
