-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "name" = 'Whisky Royal Circle Honey 200ml',
    "type" = 'whisky',
    "size_ml" = 200,
    "sell_price_client" = 990,
    "buy_price_supplier" = 800,
    "batch_size" = 24
WHERE "id" = 47;
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM "products"));
INSERT INTO "products" ("name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size")
VALUES 
  ('Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, 12);