-- Custom SQL migration file, put your code below! --
-- Actualizar solo los nombres de los productos específicos
UPDATE "products" 
SET "name" = 'Whisky Thomas Crown 200ml' 
WHERE "id" = 45;

UPDATE "products" 
SET "name" = 'Ron con café Ojos de tigre 200ml' 
WHERE "id" = 46;

-- Sincronizar la secuencia para evitar errores en el futuro
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM "products"));