-- Esquema inferido del código original. Ejecútalo en phpMyAdmin (XAMPP) o con: mysql -u root < database/schema.sql
CREATE DATABASE IF NOT EXISTS smartudy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartudy_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recordatorios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_email VARCHAR(150) NOT NULL,
  asignatura VARCHAR(100) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  fecha_recordatorio DATETIME NOT NULL,
  INDEX (usuario_email)
);

CREATE TABLE IF NOT EXISTS horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(30) DEFAULT 'Clase',
  dia_semana ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
