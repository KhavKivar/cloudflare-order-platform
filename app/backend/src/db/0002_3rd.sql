INSERT INTO "products" ("id", "name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size") 
OVERRIDING SYSTEM VALUE
VALUES 
  (45, 'Whisky Thomas Crown', 'whisky', 200, 990, 800, 12),
  (46, 'Ron con café Ojos de tigre', 'ron', 200, 990, 800, 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  size_ml = EXCLUDED.size_ml,
  sell_price_client = EXCLUDED.sell_price_client,
  buy_price_supplier = EXCLUDED.buy_price_supplier,
  batch_size = EXCLUDED.batch_size;