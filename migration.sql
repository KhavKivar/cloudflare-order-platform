--
-- PostgreSQL database dump
--

\restrict WLJs0J8dLNMImFvVB7MrtM1OKLAv7yIMg2Zo27l8IbbuylFmiLnrfQgIePnb0dk

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (1, 'c3e0d721070a1f211233ad24b721765138f93ad7679f37b848e5d5983345f80c', 1769269322723);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (2, '982e346e542059fceee0c9636fc46c0dbb4badc16b002e802e3b672c510a69f3', 1769458744491);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (3, '59cf7fb4ddb29f86fa06c789be51617245ae1ff6b05c75e9f229ec9a7891bc72', 1769806274239);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (4, 'cc62e70b3e50ea42c50c76006e7c14a67425165f9269cfcb5e19865c591ec725', 1769806799626);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (5, '0f8aff6dcbfb8466a8239f116e801a59922ce4ed97aad49f431b8257f41bcc03', 1769806948119);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (6, '69a61c2088b105975d38b40778d301f6f28ddace4b090c63dccf2113610d81dc', 1769807208871);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (7, '028f2d839b98402543f1257062f07f60d60393ef98219187e21b1f0802a6e9f5', 1769807440314);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (8, '53770a18f5d21503a6ab2dc8e50a1fb976178fbff4e896132d135c09957ac9be', 1770899777123);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (9, 'c0a000958d63412c634ee21a6d3147ee9ceab35edf0940350797c241485dae58', 1770904399136);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (10, '6bb60578832f25e4e728368133d1b5d7784275562f2e4b6d568151b045438a1a', 1770934914843);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (11, '3f51773ed07b0e10312088dfb0c7f44883973faca5a58a356e051886a9adf6d8', 1773522049836);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (12, 'a68756643289db3305862676202309abd0eba6744da90508f2e573bd8e985a74', 1773522312625);
INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (13, '9163889acf2abb413172c8bf76840f9d85ce7b8cb923f6b71466159d9b1945db', 1774977767900);


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (1, 'BOT QUISPE', 'GLADYS MARIN N°4340', '56942890011', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (2, 'BOT MALA JUNTA', 'DETECTIVE CUBILLOS 3327 N.UNIDAS', '56962526140', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (3, 'BOT (SATANAS) VOLCAN TUCUPA', 'NACIONES UNIDAS # 3411', '56939066692', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (4, 'MN ALEX-DADYÑO', 'AVDA.NACIONES UNIDAS N°3417', '56971769445', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (5, 'BOT. EL CHAPY', 'VOLCAN PARINACOTA N°4150', '56993624420', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (6, 'MN LOS PAPUCHONES', 'VOLCAN ISLUGA N°4084', '56944891604', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (7, 'MN LUDOVICO', 'VOLCAN GAS DE SALADO N°3310', '56979630097', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (8, 'MN WAJRA ADM SARA', 'FINLANDIA MZ 73 SITIO N°2 LA PAMPA', '56953685466', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (9, 'MN NEYMAR', 'ALEMANIA MZ 95', '', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (10, 'BOT EL DIABLO', 'ALEMANIA', '56971832326', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (11, 'BOT STA.ROSA DE LIMA', 'ALEMANIA N°3192', '56938716124', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (12, 'MN ALIFANZ', 'ALEMANIA N°3147 A', '56956557016', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (13, 'MN ZOE', 'ITALIA N°3149 A', '56948403667', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (14, 'MN GABY', 'LA PAMPA N°4433-A', '56979409371', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (15, 'BOT. LA PEGA', 'GABRIELA MISTRAL N° 4277', '56961553714', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (16, 'BOT VOY Y VUELVO', 'CALLE 77 N°3058 SECTOR ALTO MOLLE', '56988963574', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (17, 'BOT QUITA PENA', 'CALLE 8 4482-A', '56975931333', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (18, 'MN VICKY L/ROJO', 'SECTOR LA PAMPA CALLE 9 N° 4450', '56953310332', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (19, 'BOT MELO', 'JAPON N°4281', '56992924456', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (20, 'MN SUPER PUNTO', 'AVDA. LAS AMERICAS 4504 LOCAL 2-3', '56965015085', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (21, 'BOTILLERIA D´RUBEN', 'CALLE 7 LOCAL 1', '56995591710', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (22, 'BOT LA NONA', 'AVDA.LAS AMERICAS N°4282-A', '56964826511', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (23, 'BOT PE Y PO', 'LOS CONDORES N°3111', '56995174510', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (25, 'MN SAN LORENZO', 'SANTA TERESA #3931', '56962656488', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (26, 'MN LOCO MATIN', 'MANZANA E SITIO 5', '56994237225', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (27, 'MN DONNA JAZMIN', 'CALLE STA. INES 4015 AUTOC.', '56999625687', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (28, 'MN EL CHIU', 'LOS CONDORES 3751', '56930860905', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (29, 'BOT LOS CONDORES EX-TAKAÑA', 'AV LOS CONDORES N°3744', '56936300247', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (30, 'BOT EL LOLITO', 'LOS CONDORES N°3741', '56989186245', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (31, 'MN LAS GEMELAS', 'AVDA. LOS CONDORES N°3733', '56990552275', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (32, 'BOTILLERIA EL K CHORRO', 'AV.R. PEREZ OPAZO N°2830', '56962954847', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (33, 'MN SAN LORENZO (LILIAN CENTRO)', 'AV.LOS CONDORES N°3180', '56988557665', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (34, 'BOT SHOPY', 'AV LOS CONDORES N°3112 A', '56998779214', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (35, 'BOT ESTACION', 'AV PAMPA PERDIZ N°1085', '56975655377', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (36, 'MN EL SOL', 'LOS ALAMOS N°2876', '56953232313', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (37, 'MN NUEVO CARLITA FRENTE PE Y PO', 'LOS CONDORES N°2960', '56992824845', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (38, 'MN LA PRINCESA MAYUMI', 'AV ESMERALDA 2892', '56971050902', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (39, 'BOT JORGINHO', 'LOS ALMENDROS N°2916', '56936121681', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (40, 'BOT.LEO', 'LOS GUINDALES N°3165-B', '56942013520', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (41, 'SUPERMERCADO ANDREITA', 'LOS ALMENDROS N°2902', '56944806180', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (43, 'MN DIANA', 'LOS ALAMOS N°2954 A', '56968776486', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (44, 'MN EL TECHADO', 'LOS ALAMOS N° 3156 LOCAL 2', '56973157608', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (45, 'MN ROSITA KIWIS', 'LOS KIWIS N°2879', '56987862723', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (46, 'BOT DAMIAN', 'LOS GUINDALES N°3028', '56956573625', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (47, 'MN G & L', 'LOS MANGOS N°2897', '56965818819', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (48, 'BOT LA JUNTA', 'LOS KIWIS N°2922', '56982331358', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (49, 'BOT EL QUITASOL', 'AV. R. PEREZ OPAZO N°2905', '56998484256', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (51, 'BOTILLERIA EL SEBA', 'LOS CASTAÑOS N°3074 -3072', '56968794864', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (52, 'BOT LA PAMPA', 'LOS NOGALES 3186', '56958287420', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (53, 'BOT LAS PARCELAS', 'AVDA LAS PARCELA N°3232', '56984090608', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (54, 'DISTRIBUIDORA MANCILLA', 'AV LAS PARCELAS PC 8 LTB', '56955357087', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (55, 'MN CYBER', 'AVDA LAS PARCELAS N° 3232', '56953447445', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (56, 'BOT. EL ANGOLINO', 'MZ E SITIO N°1 SECTIR AGPIA', '56942116479', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (57, 'BOT SANTIAGUINO 6.0', 'AVDA. LAS PARCELAS N°2770', '56999795187', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (58, 'BOT DIABLA', 'AV MONTE LOS OLIVOS N°2911', '56983499292', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (59, 'MN EL CHINITO II', 'MONTE LOS OLIVOS N°2923', '56993551422', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (60, 'MN EL CHINITO (CENTRO)', 'LOS MANGOS N°2877', '56975968609', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (61, 'MN ISSAN II', 'LOS ALAMOS N°3854', '56996224595', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (63, 'BOT KENNY II', 'PARQUE ORIENTE N°2981', '56952044193', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (65, 'BOT. CONI', 'LOS AROMOS N°2939-A', '56976495310', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (67, 'BOT SIN FRONTERAS', 'AV HERNAN MERINO CORREA N°2604', '56977947224', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (68, 'MN EL PRIMO', 'LOS AROMOS N°2601 VILLA FREI', '56973764229', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (69, 'BOT HAKUNA MATATA', 'RUTA A-616 N°3556 EL BORO', '56975669766', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (70, 'MN A Y J', 'RUTA A- 616 N° 3568 LOCAL 8 LA PAMPA', '56998494446', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (71, 'MN ATTON', 'JERICO N°2334', '56993682218', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (72, 'SUP DON MIGUEL', 'JERUSALEM PARCELA 10', '56979065275', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (73, 'MN EL CIBER', 'AV.14 N°3814 V.ELENA CAFARENA', '56959801340', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (74, 'MN IÑAKI', 'TITO VIZA CHAMBE', '56993156799', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (75, 'BOT PEPE RIKO', 'S. DELAWARE N°3978 ESTRELLA NORTE', '56953969848', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (76, 'BOT. SAN LORENZO', 'CALLE 4 OF. SAL. VICT. 2219', '56961978250', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (77, 'MN LUCHITO', 'AVDA JERUSALEM N°3958', '56979915364', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (78, 'BOT ELY', 'AV 14 N°3852 EL BORO II', '56966530864', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (79, 'BOT CORIPATA', 'CALLE AMANECER N°3885', '56987643652', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (80, 'MN GUSTAVITO', 'CALLE ANTOFAGASTA N°4395', '56990370319', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (81, 'MN TAYRA EX JAVIERITO', 'LOS ANGELES N°4588', '56941981084', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (82, 'MN EL PRIMO', 'STA. ROSA SITIO 17 SITIO 20', '56942772311', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (83, 'DIST. MN "PRIMO"', 'AV.VALPO.MZ 17 SITIO 14', '56956334839', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (84, 'MN JHON Y DIOZEL', 'OVALLE N°4554 PB STA.ROSA', '56949523600', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (85, 'BOT LA NEGRA', 'OVALLE N°4462 PB STA. ROSA', '56977704034', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (87, 'MN BREY & BRAYAN (DELIA)', 'AVDA. VALPARAISO N°4322 PB STA.ROSA', '56940827775', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (88, 'MN JAVIERITO C/ALC', 'RUTA A-16 KM 10 S/N ALTO MOLLE', '56977783603', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (89, 'REST EL VIAJERO', 'RUTA A-16 N° 4567', '56972735200', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (90, 'CASINO DE JUEGOS IQQ.', 'AVDA. ARTURO PRAT N° 2755', '56940685827', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (91, 'BAR ESTILO URBANO', 'VIVAR N°1179', '56994846995', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (93, 'HOTEL GAVINA COSTAMAR', 'AVDA. ARTURO PRAT N° 1497', '56982657793', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (94, 'REST MALIBU', 'PLAYA BRAVA N°1884 PISO 2', '56966893774', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (95, 'RESTAURANTE LIKOS', 'AVDA. PLAYA BRAVA 1850', '56976209582', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (96, 'REST PACHA', 'VIVAR N° 1160', '56994164550', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (97, 'DIST DILINOR', 'ORELLA #1663', '56985976423', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (98, 'DIST. CAIMANQUE', 'TADEO HANKE 2530', '56981398784', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (100, 'BOT OASIS 5.0', 'BOLIVAR N°715', '56934274964', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (101, 'BOT EL LOLO', 'ZEGER N°1624 LOCAL 1', '56989765570', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (102, 'BOT. CHIPI CHIPI', 'BULNES N°1553-B', '56988592219', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (103, 'BOT LA OLA', 'JUAN MARTINEZ 2055', '56975698935', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (104, 'MN SAN MIGUEL', 'JUAN MARTINEZ N°302', '56940906290', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (105, 'BOT LA DONNA', 'JUAN MARTINEZ 1196', '56965807108', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (106, 'BOT TAM', 'JUAN MARTINEZ 1834', '56976547258', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (107, 'BOT PUNTO COPETE (EXPTO CLAVE)', '12 FEBRERO 1390', '56985010580', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (108, 'MINIMARKET LELA', 'PAMPA UNION N°3669', '56974106866', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (109, 'BOT LA MAXI SPA', 'LA PAMPA NO. 3481', '56974328196', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (110, 'BOT PAPAITO', 'G.MISTRAL N° 4333', '56955271138', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (111, 'MN JADE LA TORTUGA', 'PASAJE SALITRERA PACHA N°3502 L2A', '56937469716', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (112, 'MN GABRY I', 'CALLE 2 N°3601', '56994010910', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (113, 'MN GABRY II', 'CALLE 2 N°3639', '56967089077', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (114, 'BOT CHRISTIAN 3.0 II', 'PAMPA UNION N°3473', '56989291351', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (116, 'MN HNOS VILCHES', 'STA.ROSA N°3466 LA TORTUGA', '56944740524', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (117, 'BOT BLACK BULL', 'AV. LA PAMPA N°3706', '56998313859', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (118, 'Bot. EL GUATON LOYOLA', 'AV.LA PAMPA N°3649B', '56977905120', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (119, 'MN MARGOT', 'AVDA. LA PAMPA N°3594', '56950645280', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (120, 'MN SI O SI', 'AV. LAS AMERICAS 3963', '56994634587', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (121, 'MN M&R', 'AV LAS AMERICAS N°3992', '56937664468', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (122, 'BOT TORITO', 'AVDA. SANTA MARIA N°3152', '56945300529', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (123, 'BOT PUNTO CLAVE A.H.', 'AVDA. SANTA MARIA N°3152', '56949966603', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (124, 'BOT. UN MANJARSH', 'JUANITA FERNANDEZ N°3128', '56958632373', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (125, 'BOTILLERIA CORIHUARA', 'AVDA.STA.MARIA N°3164-A AUT.', '56933599572', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (126, 'MN IO CLAUDIO E.I.R.L.', 'AVDA STA. MARIA N°3236', '56953705349', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (127, 'BOT. MELCHORITA', 'AV. LAS AMERICAS N°4033 A', '56952342473', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (129, 'BOT EL TOMALO', 'AV LAS AMERICAS N° 4205', '56968539681', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (130, 'BOT EL CAMINO', 'AV. LAS AMERICAS 4257-A', '56975720369', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (131, 'BOT GARCIA', 'AV. LAS AMERICAS N°4278', '56990167784', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (132, 'MN BAYRON', 'AV LAS AMERICAS N°4426-A', '56982819290', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (133, 'MN GERMAYONY', 'CALLE 7 N°4373', '56961312457', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (134, 'MN GABRY III', 'FRANCIA 3138 A.H.', '56959655659', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (135, 'MN VICKY', 'INGLATERRA N° 3161', '56998086425', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (136, 'BOT. URKUPIÑA', 'GLADYS MARIN N° 4232 L/2', '56932769837', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (137, 'BOT COCHABAMBA', 'GLADYS MARIN N°4231 LOCAL 4', '56967455349', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (138, 'MN ALEJANDRA Y GAEL', 'ALEMANIA N°3233', '56985878014', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (139, 'MN DEJAVU II', 'AVDA. GLADYS MARIN N°4292', '56951846587', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (140, 'MN LAS PALMAS', 'GLADYS MARIN N°4402', '56931433988', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (141, 'BOT GERZON', 'GLADYS MARIN N°4338', '56932623065', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (142, 'MN ARIAS II', 'AVDA. LA TIRANA N°2878-B', '56942533765', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (143, 'MN SAN LUIS', 'AV. LA TIRANA N°3543-A', '56984527987', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (144, 'BOT ALY - MOLY', 'PDTE. RIO SECO N° 2414', '56986622423', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (145, 'BOT MIL TRAGOS', 'RANCAGUA N°3307 LOCAL 5', '56958730135', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (146, 'BOT KM 69', 'AV. LA TIRANA # 3745 LOCAL 15', '56953743380', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (147, 'BOT LA QUEEN', 'AV. LA TIRANA 3745 LOCAL N° 3', '56999644320', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (148, 'MN EL VALLE', 'VIA LOCAL N°3970', '56961421126', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (149, 'BOT KONBINI', 'AVDA LA TIRANA N°4800', '56968016080', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (150, 'BOT BLACK AND WHITE (Euromax)', '18 SEPTIEMBRE N°1576', '56951997365', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (151, 'BOTILLERIA ANDRES', '21 DE MAYO #1415', '56998433803', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (152, 'BOTILLERIA LA BOYA', '21 DE MAYO 694', '56950918704', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (153, 'MN ESPERANZA', 'THOMPSON N°1780', '56957618594', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (154, 'MN M&R', 'VIVAR N°1397', '56963902366', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (155, 'BOT ORIENTE', 'ARTURO PEREZ CANTO 1158', '56965927702', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (156, 'MN CITY MARKET', 'ORELLA N°2010', '56999674261', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (157, 'SUP SAN LUIS', 'ORELLA N°2227', '56978489556', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (158, 'MN MI MARI II (EX BAQUEDANO)', 'O HIGGINS N°1987', '56941831090', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (159, 'BOT BAJO O', 'ERRAZURIZ 254', '56944269580', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (160, 'BOT DOÑA ANITA', 'LOS MAITENES N°1448', '56921875433', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (161, 'MN FLOR DE HUARA', 'HEROES CONCEP N°894//HIGGINS N°1899', '56945542939', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (163, 'MN ELISA', 'LINCOYAN N° 1973', '56944084746', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (164, 'MN CARMEN ANDREA', 'HERNAN FUENZALIDA 1440', '56992113048', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (166, 'MN UNION', 'CESPEDES Y GONZALEZ 1592 B', '56994167514', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (167, 'BOT. EL NORTINO', 'GENARO GALLO N°2110', '56978525095', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (169, 'BOT SPACIO TOTO', 'DIEGO PORTALES N°1887', '56988038790', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (170, 'BOT JUANITO LAS ROSAS', 'LAS ROSAS N°2182 A', '56976035848', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (171, 'MN SAN SEBASTIAN', 'LAS VIOLETAS N°1815 POBL 11', '56946875920', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (172, 'BOTILLERIA EL BANDIDO', 'BERTHIC HUMBERT 2488 - POB. G.CARREN', '56992739027', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (173, 'BOT. DON LEO', 'AVDA. TADEO HAENKE N°2081', '56968475955', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (174, 'BOT LA NEGRITA', 'PSJE. ARICA # 2269', '56930383945', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (175, 'BOT. LOS NEGROS', 'LLANQUIHUE N°2608', '56993404734', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (176, 'BOT SAN LORENZO', 'LOS CLAVELES N°1814', '56932083142', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (178, 'BOT EL FANTA', 'LAS ZAMPOÑAS N° 2407', '56930826714', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (179, 'MN FREDDY', 'AV.GOMEZ CARREÑO # 2309', '56984261893', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (180, 'MN MARCELINO PAN Y VINO', 'CERRO DRAGON 2801', '56942942037', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (181, 'BOTILLERIA RICARDO', 'PSJE. HUARA N°2922 OF. SAL VICT.', '56962611329', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (182, 'BOT EL VECINO', 'AVDA PLAYA BRAVA 2084', '56987440323', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (183, 'BOT EL MASTER', 'CASTRO RAMOS N°2510', '56981456970', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (184, 'SUPERMERCADO JUANITO LOS MOLLES', 'SANTIAGO POLANCO N°2315', '56995454190', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (185, 'BOT 911 2.0', 'RANCAGUA 2936 ISLUGA 3', '56933650329', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (186, 'BOT MEA CULPA 2.0', 'CERRO DRAGON 3572', '56997491644', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (187, 'MN ARIAS', 'GRAL H.FUENZALIDA N°1415 POB MIGUEL C', '56956136618', NULL);
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (188, 'Botillería Caserón ', 'Grumete Bolados N°75 El Morro', '+56964603780', '+56964603780');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (189, 'Bot Black BULL Z7', 'Av. La Pampa N°3649 B Alto Hospicio ', '+56934689343', '+56934689343');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (190, 'Botillería Madagascar', 'Madagascar  N°3105 La Pampa A. Hospicio ', '+56978468702', '+56978468702');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (191, 'Viviana Diaz pendiente Rendición ', 'Vigias del Mar Chile ', '+56995499680', '+56995499680');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (192, 'Botillería La Tirana ', 'Avda la Tirana 2983 Iquique ', '+56930747211', '+56930747211');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (193, 'Mn Beba ', 'Avda. Valparaíso Sta. Rosa alto Hospicio ', '+56949751175', '+56949751175');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (194, 'Bot Milenio ', 'Pb. Sta Rosa Alto Hospicio ', '+56972035416', '+56972035416');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (195, 'Mn Fabricio ', 'Avda. Valparaíso 4401 Sta. Rosa Alto Hospicio ', '+56962339174', '+56962339174');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (196, 'Bot Chiqui ', 'Pedro gamboni 2685 Iquique ', '56932315291', '56932315291');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (197, 'Botillería El Máster ', 'Castro Ramos N°2510 Iquique ', '56931051427', '56931051427');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (212, 'Distribuidora Viviana', 'Av 2 Oriente 4833 iqq', '56995499680', '56995499680');
INSERT INTO public.clients (id, "localName", address, phone, phone_id) OVERRIDING SYSTEM VALUE VALUES (213, 'Mn Family Street', 'Los continentales 3031 A. H', '56975757015', '56975757015');


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (3, 'pending', '2026-01-26 21:18:36.511382');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (4, 'pending', '2026-01-30 21:23:32.736723');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (6, 'pending', '2026-02-04 05:23:57.821015');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (7, 'pending', '2026-02-06 00:09:19.645197');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (8, 'pending', '2026-02-18 21:59:06.077104');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (9, 'pending', '2026-02-21 19:56:34.895106');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (10, 'pending', '2026-03-09 17:09:03.640811');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (11, 'pending', '2026-03-13 22:20:52.425883');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (12, 'pending', '2026-03-14 21:14:53.527037');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (13, 'pending', '2026-03-23 22:28:51.050951');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (14, 'pending', '2026-03-31 17:27:40.66119');
INSERT INTO public.purchase_orders (id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (19, 'pending', '2026-04-04 04:06:13.83572');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (36, 188, 14, 'delivered', '2026-03-31 17:27:01.147867');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (26, 121, 10, 'delivered_paid', '2026-02-27 20:45:04.729476');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (19, 182, 7, 'delivered_paid', '2026-02-06 00:01:56.404217');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (23, 6, 9, 'delivered_paid', '2026-02-21 15:53:29.820569');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (24, 188, 9, 'delivered_paid', '2026-02-21 19:17:25.507553');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (27, 192, 11, 'delivered_paid', '2026-03-13 19:56:44.943495');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (22, 53, 9, 'delivered_paid', '2026-02-21 15:46:30.862894');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (21, 196, 8, 'delivered_paid', '2026-02-12 00:03:55.645005');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (28, 188, 11, 'delivered_paid', '2026-03-13 20:00:30.336151');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (30, 53, 11, 'delivered_paid', '2026-03-13 20:22:16.440898');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (29, 118, 11, 'delivered_paid', '2026-03-13 20:20:42.807892');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (18, 193, 7, 'delivered_paid', '2026-02-05 19:35:46.991323');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (20, 15, 7, 'delivered_paid', '2026-02-06 00:06:52.054097');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (7, 188, 4, 'delivered_paid', '2026-01-30 20:22:10.752264');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (31, 61, 11, 'delivered_paid', '2026-03-13 20:27:37.338185');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (4, 108, 3, 'delivered_paid', '2026-01-26 21:17:33.784554');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (16, 108, 6, 'delivered_paid', '2026-02-04 05:06:39.514594');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (8, 189, 4, 'delivered_paid', '2026-01-30 20:30:22.323093');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (9, 190, 4, 'delivered_paid', '2026-01-30 20:41:19.623017');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (25, 169, 10, 'delivered_paid', '2026-02-27 20:33:41.566137');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (11, 191, 4, 'delivered_paid', '2026-01-30 21:21:06.122716');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (32, 188, 12, 'delivered_paid', '2026-03-14 21:11:15.470366');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (10, 131, 4, 'delivered_paid', '2026-01-30 20:57:51.941565');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (12, 53, 6, 'delivered_paid', '2026-02-03 23:55:34.945781');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (13, 192, 6, 'delivered_paid', '2026-02-03 23:59:57.46573');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (15, 195, 6, 'delivered_paid', '2026-02-04 05:05:30.843672');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (14, 194, 6, 'delivered_paid', '2026-02-04 04:56:48.597241');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (47, 136, 19, 'pending', '2026-04-04 03:13:38.937461');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (48, 137, 19, 'pending', '2026-04-04 03:14:51.258929');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (46, 8, 19, 'pending', '2026-04-04 02:58:03.552943');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (33, 188, 13, 'delivered_paid', '2026-03-20 20:33:00.642596');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (44, 53, 19, 'pending', '2026-04-02 21:47:35.54352');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (34, 180, 13, 'delivered_paid', '2026-03-20 21:04:52.162708');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (40, 11, 19, 'pending', '2026-04-01 04:28:01.060255');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (35, 188, 13, 'delivered_paid', '2026-03-21 16:45:56.5029');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (37, 136, 19, 'pending', '2026-03-31 22:09:43.093869');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (38, 6, 19, 'pending', '2026-03-31 22:14:49.680341');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (39, 183, 19, 'pending', '2026-04-01 04:25:36.881583');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (41, 188, 19, 'pending', '2026-04-02 17:01:09.602838');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (42, 121, 19, 'pending', '2026-04-02 18:27:59.672061');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (43, 189, 19, 'pending', '2026-04-02 21:12:49.062282');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (45, 212, 19, 'pending', '2026-04-04 02:33:36.699068');
INSERT INTO public.orders (id, client_id, purchase_order_id, status, created_at) OVERRIDING SYSTEM VALUE VALUES (49, 213, 19, 'pending', '2026-04-04 03:52:10.47321');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (23, 'Ron Viejo Caldas 8 años', 'ron', NULL, 12500, 12000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (26, 'Flor de Caña 7 años 1 Lt', 'ron', 1000, 10500, 10000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (30, 'Licor Ramazzotti Rosato 700ml', 'licor', 700, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (31, 'Licor Ramazzotti Violet 700ml', 'licor', 700, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (32, 'Licor Amarula 750ml', 'licor', 750, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (33, 'Gin Beefeater Clásico blanco 750ml', 'gin', 750, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (34, 'Gin Beefeater Pink 750ml', 'gin', 750, 11500, 11000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (38, 'Tequila Dona camila c/g 1 Lt', 'tequila', 1000, 6500, 6000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (39, 'Tequila Dona camila s/g 1 Lt', 'tequila', 1000, 6500, 6000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (40, 'Tequila Olmeca blanco 700ml', 'tequila', 700, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (41, 'Tequila Olmeca Reposado 700ml', 'tequila', 700, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (43, 'Tequila José Cuervo 750ml', 'tequila', 750, 11000, 10500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (37, 'Aguardiente Blanco del Valle 1 Lt', 'aguardiente', 1000, 8000, 7500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (3, 'Whisky Jack Daniel Honey 1 Lt', 'whisky', 1000, 15500, 15000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (4, 'Whisky Jack Daniel Fire 1 Lt', 'whisky', 1000, 15500, 14000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (5, 'Whisky Black Label 1 Lt', 'whisky', 1000, 23000, 22000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (6, 'Whisky Red Label 1 Lt', 'whisky', 1000, 10000, 9500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (7, 'Ballantine Finest 1 Lt', 'whisky', 1000, 8590, 8500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (8, 'Chivas Regal 12 años 1 Lt', 'whisky', 1000, 16900, 16000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (9, 'Whisky Old Par 1 Lt', 'whisky', 1000, 23000, 22000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (10, 'Whisky Royal Circle 1 Lt C/vaso', 'whisky', 1000, 4900, 4000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (11, 'Whisky Royal Circle Honey 1 Lt C/vaso', 'whisky', 1000, 5500, 4000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (48, 'Licor Sheridans 1 Lt', 'licor', 1000, 22900, 22000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (13, 'Royal Circle Whisky & Cola 330ml', 'whisky', 330, 990, 800, NULL, 24);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (14, 'Ron Havana Club añejo Especial 1 Lt', 'ron', 1000, 6500, 6000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (15, 'Havana Club Reserva 1 Lt', 'ron', 1000, 8500, 8000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (16, 'Havana Club 7 años', 'ron', NULL, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (17, 'Havana Club 3 años 1 Lt', 'ron', 1000, 6500, 6000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (18, 'Havana Especial 750ml', 'ron', 750, 5500, 5000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (19, 'Havana Reserva 750ml', 'ron', 750, 6500, 16000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (21, 'Ron Viejo Caldas 3 años', 'ron', NULL, 5900, 5000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (22, 'Ron Viejo Caldas 5 años', 'ron', NULL, 6900, 6000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (24, 'Malibu de coco 750ml', 'ron', 750, 8900, 8000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (25, 'Flor de Caña 4 años 1 Lt', 'ron', 1000, 7900, 7000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (27, 'Ron Barcelo añejo 1 Lt', 'ron', 1000, 6000, 5500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (28, 'Ron Barcelo blanco 1 Lt', 'ron', 1000, 4500, 4000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (29, 'Ron con Café Ojos de tigre 180ml', 'ron', 180, 990, 800, NULL, 24);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (35, 'Licor Jagermeister 1 Lt 35°Alc', 'licor', 1000, 10690, 10000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (36, 'Aguardiente Antiqueño 750ml', 'aguardiente', 750, 7900, 7000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (42, 'Tequila Chocolate 700ml', 'tequila', 700, 9500, 9000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (44, 'Vodka Absolut Clásico 1 Lt', 'vodka', 1000, 11000, 11500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (1, 'Whisky Jack Daniel N°7 1 Lt', 'whisky', 1000, 15500, 15000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (2, 'Whisky Jack Daniel Manzana 1 Lt', 'whisky', 1000, 16000, 15500, NULL, 6);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (45, 'Whisky Thomas Crown 200ml', 'whisky', 200, 990, 800, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (46, 'Ron con café Ojos de tigre 200ml', 'ron', 200, 990, 800, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (12, 'Whisky Royal Circle Black 200ml', 'whisky', 200, 990, 800, NULL, 48);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (47, 'Whisky Royal Circle Honey 200ml', 'whisky', 200, 990, 800, NULL, 24);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (49, 'Baileys Original 1 Lt', 'licor', 1000, 16500, 16000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (20, 'Ron Abuelo añejo 1 Lt', 'ron', 1000, 6000, 5500, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (50, 'Gin Beefeater Clásico 1 Lt', 'gin', 1000, 10500, 10000, NULL, 12);
INSERT INTO public.products (id, name, type, size_ml, sell_price_client, buy_price_supplier, description, batch_size) OVERRIDING SYSTEM VALUE VALUES (51, 'Four Loko Caja', 'energy_drink', 1, 36500, 35000, NULL, 1);


--
-- Data for Name: order_lines; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (136, 26, 34, 11500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (137, 26, 32, 9500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (138, 26, 14, 6500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (139, 26, 8, 16900, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (140, 27, 14, 6500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (141, 27, 15, 8500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (142, 27, 34, 11500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (143, 27, 1, 15500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (144, 28, 12, 990, 96);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (145, 28, 47, 990, 96);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (146, 28, 14, 6500, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (147, 29, 15, 8500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (13, 4, 30, 9500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (14, 7, 30, 9500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (15, 7, 1, 15500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (16, 7, 34, 11500, 18);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (17, 8, 3, 15500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (18, 8, 2, 16000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (148, 29, 14, 6500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (149, 30, 6, 10000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (150, 31, 16, 9500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (151, 31, 36, 7900, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (152, 31, 11, 5500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (153, 31, 47, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (154, 32, 12, 990, 144);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (155, 32, 50, 10500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (156, 33, 34, 11500, 18);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (157, 34, 12, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (158, 34, 47, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (159, 35, 36, 7900, 20);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (31, 9, 30, 9500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (32, 9, 45, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (33, 9, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (34, 9, 12, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (160, 35, 2, 16000, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (161, 36, 51, 36500, 50);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (162, 37, 18, 5500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (163, 37, 14, 6500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (164, 37, 36, 7900, 20);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (165, 38, 8, 16900, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (166, 38, 2, 16000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (167, 38, 16, 9500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (168, 38, 1, 15500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (169, 38, 14, 6500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (170, 39, 6, 10000, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (171, 39, 2, 16000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (173, 41, 3, 15500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (174, 41, 7, 8590, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (50, 10, 34, 11500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (51, 10, 4, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (52, 10, 6, 10000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (53, 10, 11, 5500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (54, 10, 1, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (55, 10, 2, 16000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (175, 41, 12, 990, 240);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (176, 41, 47, 990, 96);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (177, 42, 12, 950, 144);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (59, 11, 1, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (60, 11, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (61, 11, 12, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (62, 12, 6, 10000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (63, 12, 7, 8590, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (64, 12, 10, 4900, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (65, 12, 38, 6500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (66, 13, 30, 9500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (67, 13, 12, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (68, 13, 11, 5500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (69, 13, 10, 4900, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (70, 14, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (71, 14, 12, 990, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (178, 42, 47, 950, 96);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (179, 42, 35, 10690, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (74, 15, 12, 990, 60);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (75, 15, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (180, 42, 2, 16000, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (77, 16, 30, 9500, 36);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (78, 16, 10, 4900, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (79, 18, 6, 10000, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (80, 18, 15, 8500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (81, 18, 16, 9500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (82, 18, 10, 4900, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (83, 18, 11, 5500, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (84, 18, 38, 6500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (85, 19, 3, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (86, 20, 3, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (87, 20, 47, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (88, 20, 12, 990, 48);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (184, 43, 2, 16000, 8);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (185, 43, 47, 990, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (186, 43, 12, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (97, 21, 6, 10000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (98, 21, 13, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (99, 21, 36, 7900, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (100, 21, 20, 6000, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (101, 22, 3, 15500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (102, 22, 34, 11500, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (103, 22, 8, 16900, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (104, 23, 34, 11500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (105, 23, 40, 9500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (106, 23, 38, 6500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (190, 44, 7, 8590, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (191, 44, 2, 16000, 6);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (192, 44, 10, 4900, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (111, 24, 33, 9500, 3);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (112, 24, 12, 990, 120);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (113, 24, 47, 990, 120);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (194, 40, 46, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (195, 46, 47, 990, 12);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (196, 46, 12, 990, 36);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (197, 47, 46, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (198, 48, 12, 990, 36);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (199, 48, 46, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (200, 49, 46, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (201, 45, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (202, 45, 3, 15500, 4);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (125, 25, 33, 9500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (126, 25, 34, 11500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (127, 25, 3, 15500, 1);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (128, 25, 4, 15500, 1);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (129, 25, 7, 8590, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (130, 25, 8, 16900, 1);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (131, 25, 14, 6500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (132, 25, 17, 6500, 2);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (133, 25, 2, 16000, 1);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (134, 25, 47, 990, 24);
INSERT INTO public.order_lines (id, order_id, product_id, price_per_unit, quantity) OVERRIDING SYSTEM VALUE VALUES (135, 25, 1, 15500, 1);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 13, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clients_id_seq', 213, true);


--
-- Name: order_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_lines_id_seq', 202, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 49, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 51, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 19, true);


--
-- PostgreSQL database dump complete
--

\unrestrict WLJs0J8dLNMImFvVB7MrtM1OKLAv7yIMg2Zo27l8IbbuylFmiLnrfQgIePnb0dk

