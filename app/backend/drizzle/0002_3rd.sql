-- Custom SQL migration file, put your code below! --

INSERT INTO "products" ("id", "name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size") 
VALUES 
  (45, 'Whisky Thomas Crown', 'whisky', 200, 990, 800, 12),
  (46, 'Ron con café Ojos de tigre', 'ron', 200, 990, 800, 12)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "size_ml" = EXCLUDED."size_ml",
  "sell_price_client" = EXCLUDED."sell_price_client",
  "buy_price_supplier" = EXCLUDED."buy_price_supplier",
  "batch_size" = EXCLUDED."batch_size";

-- Custom SQL migration file, put your code below! --

UPDATE "products" 
SET "name" = 'Whisky Jack Daniel N°7 1 Lt' 
WHERE "id" = 1;

UPDATE "products" 
SET "name" = 'Whisky Jack Daniel Manzana 1 Lt' 
WHERE "id" = 2;

-- Custom SQL migration file, put your code below! --
-- Actualizar solo los nombres de los productos específicos
UPDATE "products" 
SET "name" = 'Whisky Thomas Crown 200ml' 
WHERE "id" = 45;

UPDATE "products" 
SET "name" = 'Ron con café Ojos de tigre 200ml' 
WHERE "id" = 46;

-- (Sincronización de secuencia de Postgres eliminada; SQLite lo hace automáticamente)

-- Custom SQL migration file, put your code below! --

INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size") 
VALUES 
  ('Whisky Royal Circle Honey 200ml', 'whisky', 200, 990, 800, 24);

-- Custom SQL migration file, put your code below! --

UPDATE "products" 
SET "name" = 'Whisky Royal Circle Black 200ml' 
WHERE "id" = 12;

-- Custom SQL migration file, put your code below! --
-- Migration: Update Prices and Add New Liquors

-- 1. ACTUALIZAR PRECIOS EXISTENTES (UPDATE)

-- Ron Abuelo (ID 20): Costo $6.000 / Venta $6.500
UPDATE "products"
SET "buy_price_supplier" = 6000,
    "sell_price_client" = 6500
WHERE "id" = 20;

-- Aguardiente Blanco del Valle (ID 37): Costo $7.500 / Venta $8.000
UPDATE "products"
SET "buy_price_supplier" = 7500,
    "sell_price_client" = 8000
WHERE "id" = 37;

-- 2. INSERTAR PRODUCTOS NUEVOS (INSERT)
-- Asignando IDs nuevos (47 y 48) para no chocar con los anteriores.

INSERT INTO "products" ("id", "name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES
  -- Baileys 1 Lt: Costo $16.000 / Venta $16.500
  (47, 'Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, 12),

  -- Sheridans 1 Lt: Costo $22.000 / Venta $22.900
  (48, 'Licor Sheridans 1 Lt', 'licor', 1000, 22900, 22000, 12)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sell_price_client" = EXCLUDED."sell_price_client",
  "buy_price_supplier" = EXCLUDED."buy_price_supplier";

-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "name" = 'Whisky Royal Circle Honey 200ml',
    "type" = 'whisky',
    "size_ml" = 200,
    "sell_price_client" = 990,
    "buy_price_supplier" = 800,
    "batch_size" = 24
WHERE "id" = 47;

-- (Sincronización de secuencia de Postgres eliminada; SQLite lo hace automáticamente)

INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES 
  ('Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, 12);

-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "buy_price_supplier" = 5500,
    "sell_price_client" = 6000
WHERE "id" = 20;

-- Custom SQL migration file, put your code below! --

INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES ('Gin Beefeater Clásico Lt', 'gin', 1000, 10500, 10000, 12);

-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "name" = 'Gin Beefeater Clásico 1 Lt'
WHERE "name" = 'Gin Beefeater Clásico Lt';

-- Custom SQL migration file, put your code below! --

INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES ('Four Loko Caja', 'energy_drink', 1, 36500, 35000, 1);