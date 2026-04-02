-- Custom SQL migration file, put your code below! --

UPDATE "products"
SET "buy_price_supplier" = 5500,
    "sell_price_client" = 6000
WHERE "id" = 20;