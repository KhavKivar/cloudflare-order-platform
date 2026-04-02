-- Custom SQL migration file, put your code below! --

CREATE TYPE "order_status" AS ENUM ('pending', 'paid', 'delivered', 'delivered_paid', 'cancelled');
CREATE TYPE "purchase_order_status" AS ENUM ('pending', 'received', 'paid', 'cancelled');

CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"localName" varchar(255),
	"address" varchar(512),
	"phone" varchar(20),
	"phone_id" varchar(64),
	CONSTRAINT "clients_phone_unique" UNIQUE("phone"),
	CONSTRAINT "clients_phone_id_unique" UNIQUE("phone_id")
);

CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"name" varchar(255) NOT NULL,
	"type" varchar(64) NOT NULL,
	"size_ml" integer,
	"sell_price_client" integer NOT NULL,
	"buy_price_supplier" integer NOT NULL,
	"description" varchar(1024),
    "batch_size" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "purchase_orders" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "status" "purchase_order_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"client_id" integer NOT NULL REFERENCES "clients"("id"),
	"purchase_order_id" integer REFERENCES "purchase_orders"("id") ON DELETE SET NULL,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "order_lines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"order_id" integer NOT NULL REFERENCES "orders"("id"),
	"product_id" integer NOT NULL REFERENCES "products"("id"),
	"price_per_unit" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" integer GENERATED ALWAYS AS ("price_per_unit" * "quantity") STORED
);

INSERT INTO "products" ("id", "name", "type", "size_ml", "sell_price_client", "buy_price_supplier", "batch_size") 
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Whisky Jack Daniel N°7 1 Lt con dosificador', 'whisky', 1000, 15500, 15000, 12),
  (2, 'Whisky Jack Daniel Manzana 1 Lt con dosificador', 'whisky', 1000, 16000, 15500, 12),
  (3, 'Whisky Jack Daniel Honey 1 Lt', 'whisky', 1000, 15500, 15000, 12),
  (4, 'Whisky Jack Daniel Fire 1 Lt', 'whisky', 1000, 15500, 15000, 12),
  (5, 'Whisky Black Label 1 Lt', 'whisky', 1000, 23000, 22500, 12),
  (6, 'Whisky Red Label 1 Lt', 'whisky', 1000, 10000, 9500, 12),
  (7, 'Ballantine Finest 1 Lt', 'whisky', 1000, 8500, 8000, 12),
  (8, 'Chivas Regal 12 años 1 Lt', 'whisky', 1000, 16900, 16400, 12),
  (9, 'Whisky Old Par 1 Lt', 'whisky', 1000, 23000, 22500, 12),
  (10, 'Whisky Royal Circle 1 Lt', 'whisky', 1000, 4900, 4400, 12),
  (11, 'Whisky Royal Circle Honey 1 Lt', 'whisky', 1000, 5500, 5000, 12),
  (12, 'Whisky Royal Circle 200ml und Black', 'whisky', 200, 990, 800, 12),
  (13, 'Royal Circle Whisky & Cola 330ml', 'whisky', 330, 990, 800, 12),
  (14, 'Ron Havana Club añejo Especial 1 Lt', 'ron', 1000, 6500, 6000, 12),
  (15, 'Havana Club Reserva 1 Lt', 'ron', 1000, 8500, 8000, 12),
  (16, 'Havana Club 7 años', 'ron', null, 9500, 9000, 12),
  (17, 'Havana Club 3 años 1 Lt', 'ron', 1000, 6500, 6000, 12),
  (18, 'Havana Especial 750ml', 'ron', 750, 5500, 5000, 12),
  (19, 'Havana Reserva 750ml', 'ron', 750, 6500, 6000, 12),
  (20, 'Ron Abuelo añejo 1 Lt', 'ron', 1000, 6000, 5500, 12),
  (21, 'Ron Viejo Caldas 3 años', 'ron', null, 5900, 5400, 12),
  (22, 'Ron Viejo Caldas 5 años', 'ron', null, 6900, 6400, 12),
  (23, 'Ron Viejo Caldas 8 años', 'ron', null, 12500, 12000, 12),
  (24, 'Malibu de coco 750ml', 'ron', 750, 8900, 8400, 12),
  (25, 'Flor de Caña 4 años 1 Lt', 'ron', 1000, 7900, 7400, 12),
  (26, 'Flor de Caña 7 años 1 Lt', 'ron', 1000, 10500, 10000, 12),
  (27, 'Ron Barcelo añejo 1 Lt', 'ron', 1000, 6000, 5500, 12),
  (28, 'Ron Barcelo blanco 1 Lt', 'ron', 1000, 4500, 4000, 12),
  (29, 'Ron con Café Ojos de tigre 180ml', 'ron', 180, 990, 800, 12),
  (30, 'Licor Ramazzotti Rosato 700ml', 'licor', 700, 9500, 9000, 12),
  (31, 'Licor Ramazzotti Violet 700ml', 'licor', 700, 9500, 9000, 12),
  (32, 'Licor Amarula 750ml', 'licor', 750, 9500, 9000, 12),
  (33, 'Gin Beefeater Clásico blanco 750ml', 'gin', 750, 9500, 9000, 12),
  (34, 'Gin Beefeater Pink 750ml', 'gin', 750, 11500, 11000, 12),
  (35, 'Licor Jagermeister 1 Lt 35°Alc', 'licor', 1000, 10690, 10190, 12),
  (36, 'Aguardiente Antiqueño 750ml', 'aguardiente', 750, 7900, 7400, 12),
  (37, 'Aguardiente Blanco del Valle 1 Lt', 'aguardiente', 1000, 8000, 7500, 12),
  (38, 'Tequila Dona camila c/g 1 Lt', 'tequila', 1000, 6500, 6000, 12),
  (39, 'Tequila Dona camila s/g 1 Lt', 'tequila', 1000, 6500, 6000, 12),
  (40, 'Tequila Olmeca blanco 700ml', 'tequila', 700, 9500, 9000, 12),
  (41, 'Tequila Olmeca Reposado 700ml', 'tequila', 700, 9500, 9000, 12),
  (42, 'Tequila Chocolate 700ml', 'tequila', 700, 9900, 9400, 12),
  (43, 'Tequila José Cuervo 750ml', 'tequila', 750, 11000, 10500, 12),
  (44, 'Vodka Absolut Clásico 1 Lt', 'vodka', 1000, 11000, 10500, 12);