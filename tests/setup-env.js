// Se ejecuta antes de cada archivo de pruebas: apunta a la base de pruebas, nunca a la real.
process.env.DB_NAME = 'smartudy_test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas';
