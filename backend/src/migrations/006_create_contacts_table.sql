-- Migración: Mensajes del formulario de contacto
CREATE TABLE IF NOT EXISTS contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  asunto     VARCHAR(100) NOT NULL,
  mensaje    TEXT NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contacts_read    (is_read),
  INDEX idx_contacts_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
