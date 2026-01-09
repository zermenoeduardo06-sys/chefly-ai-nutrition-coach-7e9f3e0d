-- Create foods table with nutritional data
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  portion TEXT NOT NULL,
  portion_grams INTEGER,
  calories INTEGER NOT NULL,
  protein NUMERIC(5,1) DEFAULT 0,
  carbs NUMERIC(5,1) DEFAULT 0,
  fats NUMERIC(5,1) DEFAULT 0,
  fiber NUMERIC(5,1) DEFAULT 0,
  category TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_foods table for favorites/recents tracking
CREATE TABLE public.user_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE CASCADE,
  custom_food_data JSONB,
  usage_count INTEGER DEFAULT 1,
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, food_id)
);

-- Enable RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_foods ENABLE ROW LEVEL SECURITY;

-- Foods are readable by everyone (public database)
CREATE POLICY "Foods are viewable by everyone" 
ON public.foods FOR SELECT 
USING (true);

-- User foods policies
CREATE POLICY "Users can view their own food history" 
ON public.user_foods FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food history" 
ON public.user_foods FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food history" 
ON public.user_foods FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food history" 
ON public.user_foods FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_name ON public.foods(name);
CREATE INDEX idx_user_foods_user_id ON public.user_foods(user_id);
CREATE INDEX idx_user_foods_last_used ON public.user_foods(last_used_at DESC);

-- Insert 100+ common foods with nutritional data
INSERT INTO public.foods (name, name_en, portion, portion_grams, calories, protein, carbs, fats, fiber, category) VALUES
-- FRUTAS (15)
('Manzana', 'Apple', '1 mediana', 182, 95, 0.5, 25.0, 0.3, 4.4, 'frutas'),
('Plátano', 'Banana', '1 mediano', 118, 105, 1.3, 27.0, 0.4, 3.1, 'frutas'),
('Naranja', 'Orange', '1 mediana', 131, 62, 1.2, 15.4, 0.2, 3.1, 'frutas'),
('Fresas', 'Strawberries', '1 taza', 144, 46, 1.0, 11.1, 0.4, 2.9, 'frutas'),
('Mango', 'Mango', '1 taza', 165, 99, 1.4, 24.7, 0.6, 2.6, 'frutas'),
('Uvas', 'Grapes', '1 taza', 151, 104, 1.1, 27.3, 0.2, 1.4, 'frutas'),
('Piña', 'Pineapple', '1 taza', 165, 82, 0.9, 21.6, 0.2, 2.3, 'frutas'),
('Sandía', 'Watermelon', '1 taza', 152, 46, 0.9, 11.5, 0.2, 0.6, 'frutas'),
('Papaya', 'Papaya', '1 taza', 140, 55, 0.9, 13.7, 0.2, 2.5, 'frutas'),
('Kiwi', 'Kiwi', '1 mediano', 69, 42, 0.8, 10.1, 0.4, 2.1, 'frutas'),
('Pera', 'Pear', '1 mediana', 178, 102, 0.6, 27.1, 0.2, 5.5, 'frutas'),
('Durazno', 'Peach', '1 mediano', 150, 59, 1.4, 14.3, 0.4, 2.3, 'frutas'),
('Arándanos', 'Blueberries', '1 taza', 148, 84, 1.1, 21.4, 0.5, 3.6, 'frutas'),
('Melón', 'Cantaloupe', '1 taza', 160, 54, 1.3, 13.1, 0.3, 1.4, 'frutas'),
('Aguacate', 'Avocado', '1/2 mediano', 100, 160, 2.0, 8.5, 14.7, 6.7, 'frutas'),

-- VERDURAS (15)
('Brócoli', 'Broccoli', '1 taza cocido', 156, 55, 3.7, 11.2, 0.6, 5.1, 'verduras'),
('Espinaca', 'Spinach', '1 taza cruda', 30, 7, 0.9, 1.1, 0.1, 0.7, 'verduras'),
('Tomate', 'Tomato', '1 mediano', 123, 22, 1.1, 4.8, 0.2, 1.5, 'verduras'),
('Zanahoria', 'Carrot', '1 mediana', 61, 25, 0.6, 5.8, 0.1, 1.7, 'verduras'),
('Lechuga romana', 'Romaine lettuce', '1 taza', 47, 8, 0.6, 1.5, 0.1, 1.0, 'verduras'),
('Pepino', 'Cucumber', '1 taza', 104, 16, 0.7, 3.8, 0.1, 0.5, 'verduras'),
('Calabacín', 'Zucchini', '1 taza', 124, 21, 1.5, 3.9, 0.4, 1.2, 'verduras'),
('Pimiento rojo', 'Red bell pepper', '1 mediano', 119, 37, 1.2, 7.2, 0.4, 2.5, 'verduras'),
('Cebolla', 'Onion', '1/2 taza', 80, 32, 0.9, 7.5, 0.1, 1.4, 'verduras'),
('Champiñones', 'Mushrooms', '1 taza', 70, 15, 2.2, 2.3, 0.2, 0.7, 'verduras'),
('Ejotes', 'Green beans', '1 taza', 100, 31, 1.8, 7.0, 0.1, 2.7, 'verduras'),
('Coliflor', 'Cauliflower', '1 taza', 100, 25, 1.9, 5.3, 0.1, 2.0, 'verduras'),
('Apio', 'Celery', '1 taza', 101, 16, 0.7, 3.0, 0.2, 1.6, 'verduras'),
('Elote', 'Corn', '1 mazorca', 90, 77, 2.9, 17.1, 1.1, 2.4, 'verduras'),
('Papa', 'Potato', '1 mediana', 150, 130, 2.9, 29.6, 0.2, 2.4, 'verduras'),

-- PROTEÍNAS (20)
('Pechuga de pollo', 'Chicken breast', '100g cocida', 100, 165, 31.0, 0.0, 3.6, 0.0, 'proteinas'),
('Huevo cocido', 'Boiled egg', '1 grande', 50, 78, 6.3, 0.6, 5.3, 0.0, 'proteinas'),
('Huevo revuelto', 'Scrambled egg', '1 grande', 61, 91, 6.1, 1.0, 6.7, 0.0, 'proteinas'),
('Atún enlatado', 'Canned tuna', '100g', 100, 116, 25.5, 0.0, 0.8, 0.0, 'proteinas'),
('Salmón', 'Salmon', '100g cocido', 100, 208, 20.4, 0.0, 13.4, 0.0, 'proteinas'),
('Carne de res molida', 'Ground beef', '100g cocida', 100, 250, 26.1, 0.0, 15.4, 0.0, 'proteinas'),
('Bistec de res', 'Beef steak', '100g cocido', 100, 271, 26.0, 0.0, 18.0, 0.0, 'proteinas'),
('Cerdo lomo', 'Pork loin', '100g cocido', 100, 143, 26.0, 0.0, 3.5, 0.0, 'proteinas'),
('Pavo pechuga', 'Turkey breast', '100g', 100, 135, 30.0, 0.0, 0.7, 0.0, 'proteinas'),
('Camarones', 'Shrimp', '100g', 100, 99, 24.0, 0.2, 0.3, 0.0, 'proteinas'),
('Tilapia', 'Tilapia', '100g cocida', 100, 128, 26.0, 0.0, 2.7, 0.0, 'proteinas'),
('Tofu firme', 'Firm tofu', '100g', 100, 144, 17.3, 2.8, 8.7, 2.3, 'proteinas'),
('Frijoles negros', 'Black beans', '1/2 taza', 86, 114, 7.6, 20.4, 0.5, 7.5, 'proteinas'),
('Lentejas', 'Lentils', '1/2 taza cocidas', 99, 115, 8.9, 20.0, 0.4, 7.8, 'proteinas'),
('Garbanzos', 'Chickpeas', '1/2 taza', 82, 134, 7.3, 22.5, 2.1, 6.2, 'proteinas'),
('Jamón de pavo', 'Turkey ham', '2 rebanadas', 56, 44, 8.4, 0.6, 0.8, 0.0, 'proteinas'),
('Tocino', 'Bacon', '2 tiras', 16, 87, 5.8, 0.2, 6.9, 0.0, 'proteinas'),
('Salchicha', 'Sausage', '1 pieza', 48, 137, 5.4, 0.9, 12.4, 0.0, 'proteinas'),
('Sardinas enlatadas', 'Canned sardines', '100g', 100, 208, 24.6, 0.0, 11.5, 0.0, 'proteinas'),
('Albóndigas', 'Meatballs', '3 piezas', 85, 177, 12.0, 5.5, 11.8, 0.3, 'proteinas'),

-- LÁCTEOS (12)
('Leche entera', 'Whole milk', '1 taza', 244, 149, 7.7, 11.7, 8.0, 0.0, 'lacteos'),
('Leche descremada', 'Skim milk', '1 taza', 245, 83, 8.3, 12.2, 0.2, 0.0, 'lacteos'),
('Yogur griego natural', 'Greek yogurt', '170g', 170, 100, 17.0, 6.0, 0.7, 0.0, 'lacteos'),
('Yogur de fresa', 'Strawberry yogurt', '170g', 170, 154, 5.6, 27.0, 2.0, 0.0, 'lacteos'),
('Queso cheddar', 'Cheddar cheese', '30g', 30, 113, 7.0, 0.4, 9.3, 0.0, 'lacteos'),
('Queso mozzarella', 'Mozzarella', '30g', 30, 85, 6.3, 0.6, 6.3, 0.0, 'lacteos'),
('Queso cottage', 'Cottage cheese', '1/2 taza', 113, 111, 12.5, 4.5, 4.9, 0.0, 'lacteos'),
('Queso panela', 'Panela cheese', '30g', 30, 80, 6.0, 1.0, 6.0, 0.0, 'lacteos'),
('Crema', 'Sour cream', '2 cdas', 30, 60, 0.7, 1.2, 5.8, 0.0, 'lacteos'),
('Mantequilla', 'Butter', '1 cda', 14, 102, 0.1, 0.0, 11.5, 0.0, 'lacteos'),
('Leche de almendra', 'Almond milk', '1 taza', 240, 39, 1.0, 3.4, 2.5, 0.5, 'lacteos'),
('Helado de vainilla', 'Vanilla ice cream', '1/2 taza', 66, 137, 2.3, 15.6, 7.3, 0.5, 'lacteos'),

-- GRANOS Y CEREALES (12)
('Arroz blanco', 'White rice', '1 taza cocido', 158, 206, 4.3, 44.5, 0.4, 0.6, 'granos'),
('Arroz integral', 'Brown rice', '1 taza cocido', 195, 218, 4.5, 45.8, 1.6, 3.5, 'granos'),
('Pan blanco', 'White bread', '1 rebanada', 25, 67, 2.0, 12.7, 0.8, 0.6, 'granos'),
('Pan integral', 'Whole wheat bread', '1 rebanada', 28, 69, 3.6, 11.6, 1.1, 1.9, 'granos'),
('Tortilla de maíz', 'Corn tortilla', '1 pieza', 26, 52, 1.4, 10.7, 0.7, 1.5, 'granos'),
('Tortilla de harina', 'Flour tortilla', '1 pieza', 45, 140, 3.5, 23.6, 3.5, 1.3, 'granos'),
('Avena', 'Oatmeal', '1/2 taza seca', 40, 150, 5.0, 27.0, 2.5, 4.0, 'granos'),
('Pasta cocida', 'Cooked pasta', '1 taza', 140, 221, 8.1, 43.2, 1.3, 2.5, 'granos'),
('Cereal de maíz', 'Corn flakes', '1 taza', 28, 100, 2.0, 24.0, 0.0, 0.7, 'granos'),
('Quinoa', 'Quinoa', '1 taza cocida', 185, 222, 8.1, 39.4, 3.6, 5.2, 'granos'),
('Granola', 'Granola', '1/2 taza', 61, 298, 6.6, 32.5, 14.7, 3.5, 'granos'),
('Galletas saladas', 'Saltine crackers', '5 piezas', 15, 65, 1.4, 11.0, 1.7, 0.4, 'granos'),

-- BEBIDAS (10)
('Café negro', 'Black coffee', '1 taza', 240, 2, 0.3, 0.0, 0.0, 0.0, 'bebidas'),
('Café con leche', 'Coffee with milk', '1 taza', 240, 67, 3.4, 6.0, 3.4, 0.0, 'bebidas'),
('Jugo de naranja', 'Orange juice', '1 taza', 248, 112, 1.7, 25.8, 0.5, 0.5, 'bebidas'),
('Jugo de manzana', 'Apple juice', '1 taza', 248, 114, 0.3, 28.0, 0.3, 0.2, 'bebidas'),
('Refresco cola', 'Cola', '1 lata', 355, 140, 0.0, 39.0, 0.0, 0.0, 'bebidas'),
('Agua de coco', 'Coconut water', '1 taza', 240, 46, 1.7, 8.9, 0.5, 2.6, 'bebidas'),
('Té verde', 'Green tea', '1 taza', 240, 2, 0.0, 0.0, 0.0, 0.0, 'bebidas'),
('Smoothie de frutas', 'Fruit smoothie', '1 taza', 250, 150, 2.0, 33.0, 1.0, 2.0, 'bebidas'),
('Licuado de plátano', 'Banana shake', '1 taza', 250, 180, 5.0, 30.0, 4.5, 2.0, 'bebidas'),
('Horchata', 'Horchata', '1 taza', 240, 120, 1.0, 25.0, 2.0, 0.5, 'bebidas'),

-- SNACKS (12)
('Almendras', 'Almonds', '1/4 taza', 35, 207, 7.6, 7.6, 17.9, 4.3, 'snacks'),
('Nueces', 'Walnuts', '1/4 taza', 30, 196, 4.6, 3.9, 19.6, 2.0, 'snacks'),
('Cacahuates', 'Peanuts', '1/4 taza', 36, 207, 9.4, 5.9, 17.9, 2.4, 'snacks'),
('Barra de granola', 'Granola bar', '1 barra', 35, 140, 3.0, 19.0, 6.0, 1.5, 'snacks'),
('Palomitas', 'Popcorn', '3 tazas', 24, 93, 3.0, 18.7, 1.1, 3.6, 'snacks'),
('Chips de papa', 'Potato chips', '15 piezas', 28, 152, 2.0, 15.0, 9.8, 1.2, 'snacks'),
('Galletas de chocolate', 'Chocolate cookies', '2 piezas', 30, 140, 1.5, 20.0, 6.5, 0.8, 'snacks'),
('Chocolate oscuro', 'Dark chocolate', '30g', 30, 170, 2.2, 13.0, 12.0, 3.1, 'snacks'),
('Frutos secos mixtos', 'Mixed nuts', '1/4 taza', 35, 203, 5.2, 8.7, 17.6, 2.4, 'snacks'),
('Barra de proteína', 'Protein bar', '1 barra', 50, 200, 20.0, 22.0, 6.0, 3.0, 'snacks'),
('Pasas', 'Raisins', '1/4 taza', 41, 123, 1.3, 32.7, 0.2, 1.9, 'snacks'),
('Gelatina', 'Gelatin', '1 taza', 135, 80, 2.0, 19.0, 0.0, 0.0, 'snacks'),

-- COMIDAS PREPARADAS (15)
('Tacos de carne', 'Beef tacos', '2 tacos', 180, 340, 18.0, 26.0, 18.0, 3.0, 'comidas'),
('Burrito de pollo', 'Chicken burrito', '1 pieza', 250, 420, 22.0, 48.0, 15.0, 4.0, 'comidas'),
('Ensalada César', 'Caesar salad', '1 plato', 200, 180, 8.0, 8.0, 14.0, 2.0, 'comidas'),
('Pizza de pepperoni', 'Pepperoni pizza', '1 rebanada', 107, 298, 12.4, 33.6, 12.7, 2.3, 'comidas'),
('Hamburguesa', 'Hamburger', '1 pieza', 200, 450, 24.0, 35.0, 23.0, 2.0, 'comidas'),
('Sándwich de jamón', 'Ham sandwich', '1 pieza', 150, 280, 14.0, 30.0, 11.0, 2.0, 'comidas'),
('Quesadilla', 'Quesadilla', '1 pieza', 120, 300, 12.0, 26.0, 16.0, 1.5, 'comidas'),
('Sopa de pollo', 'Chicken soup', '1 taza', 240, 120, 9.0, 12.0, 4.0, 1.0, 'comidas'),
('Enchiladas verdes', 'Green enchiladas', '2 piezas', 200, 380, 18.0, 30.0, 20.0, 4.0, 'comidas'),
('Arroz con pollo', 'Chicken with rice', '1 plato', 280, 380, 28.0, 40.0, 10.0, 2.0, 'comidas'),
('Ceviche', 'Ceviche', '1 taza', 150, 140, 18.0, 10.0, 3.0, 2.0, 'comidas'),
('Chilaquiles', 'Chilaquiles', '1 plato', 250, 420, 16.0, 38.0, 22.0, 5.0, 'comidas'),
('Torta de milanesa', 'Milanesa sandwich', '1 pieza', 280, 550, 26.0, 48.0, 28.0, 3.0, 'comidas'),
('Pozole', 'Pozole', '1 tazón', 350, 280, 18.0, 30.0, 10.0, 5.0, 'comidas'),
('Flautas', 'Flautas', '3 piezas', 150, 320, 14.0, 28.0, 18.0, 3.0, 'comidas');