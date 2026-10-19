// Express 4 no captura errores de funciones async: este envoltorio los manda al manejador de errores.
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
