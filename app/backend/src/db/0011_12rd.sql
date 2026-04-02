-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "name" = 'Gin Beefeater Clásico 1 Lt'
WHERE "name" = 'Gin Beefeater Clásico Lt';