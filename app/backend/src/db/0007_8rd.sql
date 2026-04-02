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
OVERRIDING SYSTEM VALUE
VALUES
  -- Baileys 1 Lt: Costo $16.000 / Venta $16.500
  (47, 'Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, 12),

  -- Sheridans 1 Lt: Costo $22.000 / Venta $22.900
  (48, 'Licor Sheridans 1 Lt', 'licor', 1000, 22900, 22000, 12)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sell_price_client" = EXCLUDED."sell_price_client",
  "buy_price_supplier" = EXCLUDED."buy_price_supplier";