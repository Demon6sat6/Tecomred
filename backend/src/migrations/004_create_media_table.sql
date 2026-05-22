-- Migración: Biblioteca de medios (imágenes subidas desde el admin)
CREATE TABLE IF NOT EXISTS media (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  filename      VARCHAR(255) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  size_bytes    INT NOT NULL DEFAULT 0,
  mime_type     VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
  alt_text      VARCHAR(255) NOT NULL DEFAULT '',
  width         INT DEFAULT NULL,
  height        INT DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
