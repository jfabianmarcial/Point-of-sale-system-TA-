DROP DATABASE IF EXISTS pos_abarrotes;
CREATE DATABASE pos_abarrotes;
USE pos_abarrotes;

-- 1. TABLAS MAESTRAS (No dependen de nadie)
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(200),
  limite_credito DECIMAL(10,2) DEFAULT 500.00,
  saldo_deuda DECIMAL(10,2) DEFAULT 0.00,
  es_vip BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50),
  stock INT DEFAULT 0,
  codigo VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion VARCHAR(200),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLAS DE TRANSACCIONES (Dependen de las maestras)

CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(20) NOT NULL UNIQUE, -- Añadido UNIQUE para evitar folios duplicados
  cliente_id INT,
  cajero VARCHAR(100) DEFAULT 'Cajero',
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta') DEFAULT 'efectivo',
  monto_pagado DECIMAL(10,2) DEFAULT 0,
  cambio DECIMAL(10,2) DEFAULT 0,
  estado ENUM('completada', 'cancelada') DEFAULT 'completada',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT, -- Cambiado a opcional por si se borra el producto pero queda el registro
  nombre_producto VARCHAR(100) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

CREATE TABLE movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  cantidad INT NOT NULL,
  cantidad_anterior INT NOT NULL,
  cantidad_nueva INT NOT NULL,
  costo_unitario DECIMAL(10,2) DEFAULT 0,
  proveedor_id INT,
  nota TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_mov_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE abonos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  nota TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_abono_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE cortes_caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cajero VARCHAR(100) NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_corte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_ventas INT DEFAULT 0,
  total_efectivo DECIMAL(10,2) DEFAULT 0,
  total_tarjeta DECIMAL(10,2) DEFAULT 0,
  total_ingresos DECIMAL(10,2) DEFAULT 0,
  ticket_promedio DECIMAL(10,2) DEFAULT 0,
  total_productos INT DEFAULT 0,
  notas TEXT
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cajero') DEFAULT 'cajero',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre) VALUES
('Bebidas'),
('Botanas'),
('Panadería'),
('Lácteos'),
('Cigarros');

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@tienda.com', '$2b$10$qXx4V.A3HywwPbkNaa.ZD.4usAOI2kHIxkSm66dCyTbWFPlLRvgHi', 'admin'),
('Juan', 'juan@tienda.com', '$2b$10$qXx4V.A3HywwPbkNaa.ZD.4usAOI2kHIxkSm66dCyTbWFPlLRvgHi', 'cajero');

SELECT * FROM usuarios;
-- 3. INSERCIÓN DE DATOS (En orden de dependencia)

INSERT INTO clientes (nombre, telefono, direccion, limite_credito, saldo_deuda, es_vip) VALUES
('Juan Pérez', '222-555-0101', 'Calle Morelos 12', 1000.00, 150.00, FALSE),
('María García', '222-555-0202', 'Av. Juárez 45', 2000.00, 0.00, TRUE),
('Carlos López', '222-555-0303', 'Calle Hidalgo 8', 500.00, 480.00, FALSE),
('Ana Martínez', '222-555-0404', 'Blvd. Norte 33', 1500.00, 0.00, TRUE),
('Pedro Sánchez', '222-555-0505', 'Calle Sur 21', 500.00, 320.00, FALSE),
('Rosa Hernández', '222-555-0606', 'Av. Reforma 7', 800.00, 0.00, FALSE);

INSERT INTO productos (nombre, precio, categoria, stock, codigo) VALUES
('Agua 1L', 25.00, 'Bebidas', 16, '425425445245'),
('Coca Cola 600ml', 18.50, 'Bebidas', 34, '7501055300051'),
('Galletas Marías', 12.50, 'Botanas', 10, '7501234567890'),
('Leche Lala 1L', 23.00, 'Lácteos', 4, '7501055700038'),
('Pan Bimbo', 13.00, 'Panadería', 0, '7441029301112');

INSERT INTO proveedores (nombre, telefono, email) VALUES
('Distribuidora Bepensa', '2221234567', 'ventas@bepensa.com'),
('Grupo Bimbo', '2227654321', 'distribución@bimbo.com'),
('Sabritas SA de CV', '2229876543', 'ventas@sabritas.com'),
('Lala SA de CV', '2221112233', 'pedidos@lala.com');

INSERT INTO ventas (folio, cliente_id, cajero, subtotal, iva, total, metodo_pago, monto_pagado, cambio) VALUES
('VTA-0001', 1, 'Juan', 51.50, 0, 51.50, 'efectivo', 100, 48.50),
('VTA-0002', 2, 'María', 23.00, 0, 23.00, 'tarjeta', 23.00, 0),
('VTA-0003', 1, 'Juan', 33.50, 0, 33.50, 'efectivo', 50, 16.50);

INSERT INTO detalle_ventas (venta_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal) VALUES
(1, 2, 'Coca Cola 600ml', 18.50, 2, 37.00),
(1, 3, 'Galletas Marías', 12.50, 1, 12.50), -- Ajustado para que coincidan IDs
(2, 4, 'Leche Lala 1L', 23.00, 1, 23.00),
(3, 2, 'Coca Cola 600ml', 18.50, 1, 18.50),
(3, 1, 'Agua 1L', 12.00, 1, 12.00);
INSERT INTO abonos (cliente_id, monto, nota) VALUES
(1, 50.00, 'Abono en efectivo'),
(3, 100.00, 'Abono parcial'),
(5, 200.00, 'Abono en efectivo');

INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, costo_unitario, proveedor_id, nota) VALUES
(1, 'entrada', 24, 0, 24, 12.00, 1, 'Primer surtido'),
(2, 'entrada', 15, 0, 15, 10.00, 3, 'Primer surtido');

SELECT * FROM cortes_caja;
SELECT * FROM ventas;
SELECT * FROM detalle_ventas;
SELECT id, folio, total, fecha FROM ventas ORDER BY fecha DESC;
SELECT * FROM categorias;
