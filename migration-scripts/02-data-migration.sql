-- ============================================
-- CHEFLY - MIGRACIÓN DE DATOS
-- Archivo 2: Datos (Achievements, Tiers, Plans, Recipes)
-- ============================================

-- ============================================
-- PASO 1: INSERTAR ACHIEVEMENTS (15 logros)
-- ============================================

INSERT INTO public.achievements (id, key, title, description, icon, requirement_type, requirement_value, points_reward) VALUES
('ecbc1885-100e-4be2-bb15-ce88cd14df39', 'first_meal', 'Primera Comida', 'Completa tu primera comida saludable', '🍽️', 'meals_completed', 1, 50),
('757295d8-517b-4991-b3b5-56bd935e4e5b', 'meals_3', 'Aprendiz', 'Completa 3 comidas', '🎓', 'meals_completed', 3, 75),
('b24dd77e-b93f-46e6-917c-ca360a693b57', 'meals_10', 'Entusiasta', 'Completa 10 comidas', '🌟', 'meals_completed', 10, 100),
('a8b9e969-65b8-44f7-924f-64249764e6b0', 'meals_30', 'Experto', 'Completa 30 comidas', '🏆', 'meals_completed', 30, 150),
('43d196ce-8ddc-4ec0-aa3d-2b7887ed80af', 'meals_50', 'Maestro', 'Completa 50 comidas', '👑', 'meals_completed', 50, 200),
('85c9d8c9-771a-4d7a-a73c-2d40c0837bc0', 'meals_100', 'Leyenda', 'Completa 100 comidas', '⭐', 'meals_completed', 100, 300),
('c3f124e7-f1f6-44e1-b47d-afc6c4d09363', 'streak_3', 'Constante', 'Mantén una racha de 3 días', '🔥', 'streak', 3, 100),
('fd000323-96c5-4c90-8d24-2f0b541801e9', 'streak_7', 'Primera Semana', 'Mantén una racha de 7 días', '📅', 'streak', 7, 150),
('b52500b9-62dd-47b6-b32b-416eaf616816', 'streak_14', 'Dos Semanas', 'Mantén una racha de 14 días', '💪', 'streak', 14, 200),
('d3a36798-f1ec-4fd1-b27c-8e5a28ac1611', 'streak_30', '30 Días', 'Mantén una racha de 30 días increíble', '🎯', 'streak', 30, 300),
('a92d81c8-0633-4d07-8a79-5f0b65d23365', 'points_100', 'Centenario', 'Acumula 100 puntos', '💰', 'points', 100, 50),
('cd5cbccb-db42-40a2-9822-9fe4a3bb37d3', 'points_500', 'Medio Millón', 'Acumula 500 puntos', '💎', 'points', 500, 100),
('1ad20cdc-554c-443a-886b-6efc99cfd39a', 'points_1000', 'Millonario', 'Acumula 1000 puntos', '🏅', 'points', 1000, 200),
('c19c00ac-4c26-435b-8170-b782cdb6c5e1', 'level_5', 'Nivel 5', 'Alcanza el nivel 5', '⚡', 'points', 400, 150),
('2f671098-69c1-4982-b90e-fe820a2e1eb0', 'level_10', 'Nivel 10', 'Alcanza el nivel 10', '🚀', 'points', 900, 250);

-- ============================================
-- PASO 2: INSERTAR AFFILIATE TIERS (5 niveles)
-- ============================================

INSERT INTO public.affiliate_tiers (id, tier, name_es, name_en, color, icon, min_sales_mxn, min_conversions, commission_bonus_percentage, display_order, benefits) VALUES
('466bf703-01c9-4a39-a765-a92da37ef683', 'bronce', 'Bronce', 'Bronze', '#CD7F32', 'Award', 0, 0, 0, 1, '["Acceso al dashboard de afiliados", "Comisión base del 20-25%", "Materiales de marketing básicos"]'::jsonb),
('43c9d307-5d38-4a46-ab93-41cd17a7266a', 'plata', 'Plata', 'Silver', '#C0C0C0', 'Medal', 10000, 5, 5, 2, '["Todo lo de Bronce", "Comisión +5% adicional", "Soporte prioritario", "Materiales de marketing premium"]'::jsonb),
('992081fd-bdd4-48e4-ac44-fd0cbbf46778', 'oro', 'Oro', 'Gold', '#FFD700', 'Crown', 50000, 20, 10, 3, '["Todo lo de Plata", "Comisión +10% adicional", "Gestor de cuenta dedicado", "Acceso anticipado a nuevos productos"]'::jsonb),
('bb764d2d-fa7f-4956-9754-9125accab49a', 'platino', 'Platino', 'Platinum', '#E5E4E2', 'Star', 150000, 50, 15, 4, '["Todo lo de Oro", "Comisión +15% adicional", "Bonos trimestrales", "Co-marketing con la marca"]'::jsonb),
('393b99f4-f29c-4083-a37d-19d1943586ab', 'diamante', 'Diamante', 'Diamond', '#B9F2FF', 'Gem', 500000, 150, 25, 5, '["Todo lo de Platino", "Comisión +25% adicional", "Revenue share especial", "Eventos exclusivos VIP"]'::jsonb);

-- ============================================
-- PASO 3: INSERTAR SUBSCRIPTION PLANS (3 planes)
-- ============================================

INSERT INTO public.subscription_plans (id, name, price_mxn, billing_period, display_order, is_active, coming_soon, features) VALUES
('a72485f8-507d-4cb2-b689-ae15ae5b2d2c', 'Básico', 240, 'monthly', 1, true, false, '["Ver tu plan semanal completo", "Marcar comidas completadas", "5 mensajes de chat al día", "Seguimiento de progreso y medidas", "Sistema de logros y puntos", "Desafíos diarios"]'::jsonb),
('c3acdd46-613a-4083-9a89-38aad361f33a', 'Intermedio', 290, 'monthly', 2, true, false, '["Genera nuevos planes semanales ilimitados", "Intercambia comidas entre días", "Chat ilimitado con coach IA", "Check-in semanal adaptativo", "Sistema de amigos y comparación", "Lista de compras con cantidades reales", "Exportar recetas a PDF", "Modo offline disponible"]'::jsonb),
('e8292adf-4279-41fa-9cff-09d253565fdc', 'Premium', 300, 'monthly', 3, false, true, '["Todo lo del plan Intermedio", "Asesoría nutricional personalizada", "Planes de comidas para toda la familia", "Acceso a nutricionista certificado", "Recetas exclusivas y gourmet", "Sistema de logros premium", "Prioridad en soporte", "Reportes nutricionales avanzados"]'::jsonb);

-- ============================================
-- FIN DE DATOS BASE
-- ============================================

-- NOTA: Las recetas (339) se migrarán en un archivo separado
-- debido a su tamaño. Ver archivo 03-recipes-migration.sql
