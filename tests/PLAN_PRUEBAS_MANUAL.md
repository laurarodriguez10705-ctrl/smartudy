# Plan de pruebas manuales — Smartudy

Rellena las dos últimas columnas al ejecutar cada caso (puedes copiar la tabla a Word o Excel).

| # | Módulo | Acción | Resultado esperado | Resultado obtenido | ¿Pasó? |
|---|--------|--------|--------------------|--------------------|--------|
| 1 | Registro | Registrar un usuario con datos válidos | Mensaje de éxito; el usuario aparece en la tabla `usuarios` con la contraseña encriptada | | |
| 2 | Registro | Registrar el mismo correo otra vez | Mensaje "Este correo ya está registrado" | | |
| 3 | Registro | Dejar campos vacíos | Mensaje de campos obligatorios | | |
| 4 | Login | Iniciar sesión con datos correctos | Entra al dashboard y muestra "Hola, nombre" | | |
| 5 | Login | Contraseña incorrecta | Mensaje "Contraseña incorrecta" | | |
| 6 | Login | Correo no registrado | Lleva a la pantalla de registro | | |
| 7 | Seguridad | Abrir `/api/tareas` en el navegador sin sesión | Mensaje "No autenticado" | | |
| 8 | Seguridad | Abrir el dashboard sin haber iniciado sesión | Redirige al login | | |
| 9 | Tareas | Crear, completar y borrar una tarea | Cada acción se refleja en pantalla y en la BD | | |
| 10 | Tareas | Recargar la página (F5) | Las tareas siguen ahí | | |
| 11 | Horarios | Crear un horario con hora fin menor que inicio | Mensaje de error | | |
| 12 | Horarios | Crear y borrar un horario válido | Aparece y desaparece de la lista | | |
| 13 | Recordatorios | Crear y borrar un recordatorio | Aparece con fecha y hora; se elimina al borrar | | |
| 14 | Aislamiento | Con dos usuarios, comprobar que cada uno ve solo sus datos | Ninguno ve los datos del otro | | |
| 15 | Sesión | Pulsar "Salir" y volver al dashboard | Pide iniciar sesión de nuevo | | |
