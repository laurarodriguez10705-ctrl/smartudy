# Smartudy

Organizador de estudio: tareas, horarios, recordatorios y temporizador con zona de juegos.

## Estructura
```
smartudy/
├── public/        # Frontend (HTML, service worker)
├── src/
│   ├── config/        # Conexión a la base de datos
│   ├── middlewares/   # Autenticación JWT
│   ├── routes/        # Definición de rutas
│   ├── app.js / server.js  # Configuración y arranque
├── database/schema.sql
├── .env.example
└── package.json
```

## Puesta en marcha
1. `npm install`
2. Copia `.env.example` a `.env` y completa los valores
3. Importa `database/schema.sql` en MySQL (XAMPP)
4. `npm run dev` y abre http://localhost:4000
