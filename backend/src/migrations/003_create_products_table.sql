-- Migración: Tabla de productos (fuente única de verdad, reemplaza localStorage)
CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100) NOT NULL DEFAULT 'Switches',
  price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  original_price DECIMAL(10,2) DEFAULT NULL,
  image        VARCHAR(500) NOT NULL DEFAULT '',
  description  TEXT NOT NULL,
  specs        JSON NOT NULL DEFAULT (JSON_ARRAY()),
  stock        INT NOT NULL DEFAULT 0,
  rating       DECIMAL(3,2) NOT NULL DEFAULT 4.50,
  reviews      INT NOT NULL DEFAULT 0,
  badge        ENUM('Nuevo','Oferta','Popular','Agotado') DEFAULT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_badge    (badge),
  INDEX idx_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
