-- Migración: Banners/sliders configurables desde el admin
CREATE TABLE IF NOT EXISTS banners (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL DEFAULT '',
  subtitle   VARCHAR(255) NOT NULL DEFAULT '',
  image_url  VARCHAR(500) NOT NULL,
  link_url   VARCHAR(500) NOT NULL DEFAULT '/productos',
  link_label VARCHAR(100) NOT NULL DEFAULT 'Ver más',
  position   INT NOT NULL DEFAULT 0,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_active (is_active, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
