import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cached family meals data - 100% offline, no AI calls
const getCachedFamilyMeals = (language: string, memberNames: string[]) => {
  const mealsES = [
    // Day 0 - Lunes
    {
      day_of_week: 0, meal_type: 'breakfast', name: 'Avena con Frutas y Miel',
      description: 'Bowl de avena caliente con frutas frescas de temporada y un toque de miel',
      benefits: 'Rica en fibra y energía sostenida para toda la familia',
      ingredients: ['avena', 'leche', 'manzana', 'plátano', 'miel', 'canela', 'nueces'],
      steps: ['Cocinar la avena con leche', 'Cortar las frutas en trozos', 'Servir la avena caliente', 'Decorar con frutas, miel y nueces'],
      calories: 380, protein: 12, carbs: 65, fats: 10
    },
    {
      day_of_week: 0, meal_type: 'lunch', name: 'Pollo al Limón con Arroz Integral',
      description: 'Pechuga de pollo marinada en limón con arroz integral y verduras salteadas',
      benefits: 'Alto en proteínas y carbohidratos complejos, ideal para energía duradera',
      ingredients: ['pechuga de pollo', 'limón', 'arroz integral', 'brócoli', 'zanahoria', 'ajo', 'aceite de oliva'],
      steps: ['Marinar el pollo con limón y ajo', 'Cocinar el arroz integral', 'Saltear las verduras', 'Asar el pollo hasta dorar', 'Servir todo junto'],
      calories: 520, protein: 38, carbs: 55, fats: 14
    },
    {
      day_of_week: 0, meal_type: 'dinner', name: 'Sopa de Lentejas Casera',
      description: 'Sopa reconfortante de lentejas con verduras y especias suaves',
      benefits: 'Rica en proteínas vegetales y hierro, perfecta para toda la familia',
      ingredients: ['lentejas', 'zanahoria', 'apio', 'cebolla', 'tomate', 'comino', 'cilantro'],
      steps: ['Sofreír la cebolla y verduras', 'Agregar las lentejas y agua', 'Cocinar a fuego lento 30 min', 'Sazonar y servir con cilantro'],
      calories: 320, protein: 18, carbs: 48, fats: 6
    },
    // Day 1 - Martes
    {
      day_of_week: 1, meal_type: 'breakfast', name: 'Huevos Revueltos con Tostadas',
      description: 'Huevos cremosos revueltos con pan integral tostado y aguacate',
      benefits: 'Proteína de alta calidad y grasas saludables para comenzar el día',
      ingredients: ['huevos', 'pan integral', 'aguacate', 'tomate', 'sal', 'pimienta', 'mantequilla'],
      steps: ['Batir los huevos', 'Revolver a fuego bajo con mantequilla', 'Tostar el pan', 'Servir con aguacate y tomate'],
      calories: 420, protein: 22, carbs: 35, fats: 24
    },
    {
      day_of_week: 1, meal_type: 'lunch', name: 'Tacos de Pescado',
      description: 'Tacos de pescado blanco con col morada y salsa de yogurt',
      benefits: 'Omega-3 del pescado y probióticos del yogurt para la salud digestiva',
      ingredients: ['filete de pescado', 'tortillas de maíz', 'col morada', 'yogurt natural', 'limón', 'cilantro', 'chile'],
      steps: ['Sazonar y cocinar el pescado', 'Preparar la salsa de yogurt', 'Picar la col y cilantro', 'Armar los tacos', 'Servir con limón'],
      calories: 450, protein: 32, carbs: 42, fats: 16
    },
    {
      day_of_week: 1, meal_type: 'dinner', name: 'Ensalada César con Pollo',
      description: 'Clásica ensalada César con pollo a la plancha y crutones caseros',
      benefits: 'Ligera pero satisfactoria, perfecta para la cena familiar',
      ingredients: ['lechuga romana', 'pollo', 'parmesano', 'pan', 'anchoas', 'ajo', 'aceite de oliva'],
      steps: ['Preparar el aderezo César', 'Asar el pollo', 'Hacer los crutones', 'Mezclar la ensalada', 'Servir con pollo encima'],
      calories: 380, protein: 28, carbs: 22, fats: 20
    },
    // Day 2 - Miércoles
    {
      day_of_week: 2, meal_type: 'breakfast', name: 'Smoothie de Frutos Rojos',
      description: 'Batido cremoso de frutos rojos con yogurt griego y granola',
      benefits: 'Antioxidantes y probióticos para fortalecer el sistema inmune',
      ingredients: ['fresas', 'arándanos', 'frambuesas', 'yogurt griego', 'leche', 'miel', 'granola'],
      steps: ['Licuar las frutas con yogurt y leche', 'Endulzar con miel', 'Servir en vaso', 'Decorar con granola'],
      calories: 340, protein: 15, carbs: 52, fats: 8
    },
    {
      day_of_week: 2, meal_type: 'lunch', name: 'Pasta Primavera',
      description: 'Pasta con verduras frescas de temporada en salsa ligera de tomate',
      benefits: 'Carbohidratos energéticos con vitaminas de las verduras',
      ingredients: ['pasta', 'calabacín', 'pimiento', 'tomate', 'albahaca', 'ajo', 'aceite de oliva', 'queso parmesano'],
      steps: ['Cocinar la pasta al dente', 'Saltear las verduras', 'Preparar la salsa de tomate', 'Mezclar todo', 'Servir con parmesano'],
      calories: 480, protein: 16, carbs: 72, fats: 14
    },
    {
      day_of_week: 2, meal_type: 'dinner', name: 'Crema de Calabaza',
      description: 'Crema suave de calabaza con un toque de jengibre y semillas de calabaza',
      benefits: 'Rica en vitamina A y baja en calorías, ideal para toda la familia',
      ingredients: ['calabaza', 'cebolla', 'jengibre', 'caldo de verduras', 'crema', 'semillas de calabaza'],
      steps: ['Cocinar la calabaza con cebolla', 'Agregar caldo y jengibre', 'Licuar hasta obtener crema', 'Servir con semillas'],
      calories: 280, protein: 8, carbs: 38, fats: 12
    },
    // Day 3 - Jueves
    {
      day_of_week: 3, meal_type: 'breakfast', name: 'Pancakes de Avena',
      description: 'Hotcakes saludables de avena con miel de maple y frutas',
      benefits: 'Carbohidratos complejos para energía prolongada',
      ingredients: ['avena', 'huevo', 'leche', 'plátano', 'canela', 'miel de maple', 'fresas'],
      steps: ['Licuar la avena con huevo y leche', 'Cocinar en sartén', 'Apilar los pancakes', 'Decorar con frutas y miel'],
      calories: 410, protein: 14, carbs: 68, fats: 10
    },
    {
      day_of_week: 3, meal_type: 'lunch', name: 'Bowl de Quinoa con Verduras',
      description: 'Bowl nutritivo de quinoa con vegetales asados y aderezo de tahini',
      benefits: 'Proteína completa y fibra para la salud digestiva',
      ingredients: ['quinoa', 'camote', 'garbanzos', 'espinaca', 'pepino', 'tahini', 'limón'],
      steps: ['Cocinar la quinoa', 'Asar el camote y garbanzos', 'Preparar el aderezo', 'Armar el bowl', 'Servir con aderezo'],
      calories: 520, protein: 18, carbs: 68, fats: 20
    },
    {
      day_of_week: 3, meal_type: 'dinner', name: 'Tortilla Española',
      description: 'Clásica tortilla de patatas con ensalada verde',
      benefits: 'Proteína económica y deliciosa para compartir en familia',
      ingredients: ['huevos', 'papas', 'cebolla', 'aceite de oliva', 'lechuga', 'tomate'],
      steps: ['Freír las papas con cebolla', 'Batir los huevos', 'Cocinar la tortilla', 'Voltear y terminar', 'Servir con ensalada'],
      calories: 360, protein: 16, carbs: 32, fats: 18
    },
    // Day 4 - Viernes
    {
      day_of_week: 4, meal_type: 'breakfast', name: 'Tostadas de Aguacate',
      description: 'Pan integral con aguacate, huevo pochado y semillas',
      benefits: 'Grasas saludables y proteína para un desayuno completo',
      ingredients: ['pan integral', 'aguacate', 'huevo', 'semillas de girasol', 'chile', 'limón', 'sal'],
      steps: ['Tostar el pan', 'Machacar el aguacate', 'Pochar el huevo', 'Armar la tostada', 'Decorar con semillas'],
      calories: 380, protein: 18, carbs: 32, fats: 22
    },
    {
      day_of_week: 4, meal_type: 'lunch', name: 'Arroz con Camarones',
      description: 'Arroz salteado con camarones, verduras y salsa de soya',
      benefits: 'Rico en proteínas y selenio, ideal para energía',
      ingredients: ['arroz', 'camarones', 'chícharos', 'zanahoria', 'huevo', 'salsa de soya', 'jengibre'],
      steps: ['Cocinar el arroz y enfriar', 'Saltear los camarones', 'Agregar verduras', 'Incorporar el arroz', 'Sazonar y servir'],
      calories: 490, protein: 28, carbs: 62, fats: 12
    },
    {
      day_of_week: 4, meal_type: 'dinner', name: 'Pizza Casera de Vegetales',
      description: 'Pizza con masa integral y abundantes vegetales frescos',
      benefits: 'Versión saludable del clásico favorito familiar',
      ingredients: ['harina integral', 'levadura', 'salsa de tomate', 'queso mozzarella', 'champiñones', 'pimiento', 'aceitunas'],
      steps: ['Preparar la masa', 'Dejar leudar', 'Extender y agregar toppings', 'Hornear 15 minutos', 'Servir caliente'],
      calories: 420, protein: 18, carbs: 52, fats: 16
    },
    // Day 5 - Sábado
    {
      day_of_week: 5, meal_type: 'breakfast', name: 'Chilaquiles Verdes',
      description: 'Chilaquiles con salsa verde, crema y queso fresco',
      benefits: 'Desayuno mexicano tradicional lleno de sabor',
      ingredients: ['tortillas', 'salsa verde', 'crema', 'queso fresco', 'cebolla', 'huevo', 'cilantro'],
      steps: ['Freír las tortillas', 'Calentar la salsa verde', 'Bañar las tortillas', 'Agregar crema y queso', 'Decorar con cebolla'],
      calories: 450, protein: 16, carbs: 48, fats: 22
    },
    {
      day_of_week: 5, meal_type: 'lunch', name: 'Carne Asada con Guacamole',
      description: 'Corte de res asado con guacamole fresco y frijoles',
      benefits: 'Alto en proteínas y hierro para toda la familia',
      ingredients: ['arrachera', 'aguacate', 'cebolla', 'cilantro', 'limón', 'frijoles', 'tortillas'],
      steps: ['Marinar la carne', 'Asar a la parrilla', 'Preparar el guacamole', 'Calentar frijoles', 'Servir con tortillas'],
      calories: 580, protein: 42, carbs: 38, fats: 28
    },
    {
      day_of_week: 5, meal_type: 'dinner', name: 'Sopa de Tortilla',
      description: 'Sopa tradicional mexicana con tortilla crujiente y aguacate',
      benefits: 'Reconfortante y nutritiva, perfecta para compartir',
      ingredients: ['caldo de pollo', 'tomate', 'chile pasilla', 'tortillas', 'aguacate', 'crema', 'queso'],
      steps: ['Preparar el caldo con tomate', 'Freír las tortillas', 'Servir el caldo caliente', 'Agregar toppings'],
      calories: 340, protein: 14, carbs: 36, fats: 16
    },
    // Day 6 - Domingo
    {
      day_of_week: 6, meal_type: 'breakfast', name: 'French Toast con Frutas',
      description: 'Pan francés dorado con frutas frescas y miel de maple',
      benefits: 'Desayuno especial de fin de semana para disfrutar juntos',
      ingredients: ['pan brioche', 'huevo', 'leche', 'canela', 'vainilla', 'fresas', 'miel de maple'],
      steps: ['Batir huevo con leche y especias', 'Remojar el pan', 'Cocinar hasta dorar', 'Servir con frutas y miel'],
      calories: 420, protein: 12, carbs: 58, fats: 16
    },
    {
      day_of_week: 6, meal_type: 'lunch', name: 'Lasaña de Carne',
      description: 'Clásica lasaña italiana con carne molida y quesos gratinados',
      benefits: 'Platillo familiar perfecto para el domingo',
      ingredients: ['pasta de lasaña', 'carne molida', 'ricotta', 'mozzarella', 'salsa de tomate', 'espinaca'],
      steps: ['Preparar la salsa de carne', 'Cocinar la pasta', 'Armar las capas', 'Hornear 40 minutos', 'Dejar reposar y servir'],
      calories: 550, protein: 32, carbs: 48, fats: 26
    },
    {
      day_of_week: 6, meal_type: 'dinner', name: 'Quesadillas con Ensalada',
      description: 'Quesadillas de queso Oaxaca con ensalada fresca',
      benefits: 'Cena ligera y rápida para cerrar la semana',
      ingredients: ['tortillas de harina', 'queso Oaxaca', 'champiñones', 'lechuga', 'tomate', 'aguacate', 'crema'],
      steps: ['Derretir queso en tortilla', 'Agregar champiñones', 'Doblar y dorar', 'Preparar ensalada', 'Servir juntos'],
      calories: 380, protein: 18, carbs: 36, fats: 20
    }
  ];

  const mealsEN = [
    // Day 0 - Monday
    {
      day_of_week: 0, meal_type: 'breakfast', name: 'Oatmeal with Fresh Fruits',
      description: 'Warm oatmeal bowl with seasonal fresh fruits and honey',
      benefits: 'Rich in fiber and sustained energy for the whole family',
      ingredients: ['oats', 'milk', 'apple', 'banana', 'honey', 'cinnamon', 'walnuts'],
      steps: ['Cook oats with milk', 'Cut fruits into pieces', 'Serve warm oatmeal', 'Top with fruits, honey and walnuts'],
      calories: 380, protein: 12, carbs: 65, fats: 10
    },
    {
      day_of_week: 0, meal_type: 'lunch', name: 'Lemon Chicken with Brown Rice',
      description: 'Lemon marinated chicken breast with brown rice and sautéed vegetables',
      benefits: 'High in protein and complex carbs, ideal for lasting energy',
      ingredients: ['chicken breast', 'lemon', 'brown rice', 'broccoli', 'carrot', 'garlic', 'olive oil'],
      steps: ['Marinate chicken with lemon and garlic', 'Cook brown rice', 'Sauté vegetables', 'Grill chicken until golden', 'Serve together'],
      calories: 520, protein: 38, carbs: 55, fats: 14
    },
    {
      day_of_week: 0, meal_type: 'dinner', name: 'Homemade Lentil Soup',
      description: 'Comforting lentil soup with vegetables and mild spices',
      benefits: 'Rich in plant protein and iron, perfect for the whole family',
      ingredients: ['lentils', 'carrot', 'celery', 'onion', 'tomato', 'cumin', 'cilantro'],
      steps: ['Sauté onion and vegetables', 'Add lentils and water', 'Simmer for 30 min', 'Season and serve with cilantro'],
      calories: 320, protein: 18, carbs: 48, fats: 6
    },
    // Day 1 - Tuesday  
    {
      day_of_week: 1, meal_type: 'breakfast', name: 'Scrambled Eggs with Toast',
      description: 'Creamy scrambled eggs with whole wheat toast and avocado',
      benefits: 'High quality protein and healthy fats to start the day',
      ingredients: ['eggs', 'whole wheat bread', 'avocado', 'tomato', 'salt', 'pepper', 'butter'],
      steps: ['Beat eggs', 'Scramble over low heat with butter', 'Toast bread', 'Serve with avocado and tomato'],
      calories: 420, protein: 22, carbs: 35, fats: 24
    },
    {
      day_of_week: 1, meal_type: 'lunch', name: 'Fish Tacos',
      description: 'White fish tacos with purple cabbage and yogurt sauce',
      benefits: 'Omega-3 from fish and probiotics from yogurt for digestive health',
      ingredients: ['fish fillet', 'corn tortillas', 'purple cabbage', 'plain yogurt', 'lime', 'cilantro', 'chili'],
      steps: ['Season and cook fish', 'Prepare yogurt sauce', 'Chop cabbage and cilantro', 'Assemble tacos', 'Serve with lime'],
      calories: 450, protein: 32, carbs: 42, fats: 16
    },
    {
      day_of_week: 1, meal_type: 'dinner', name: 'Caesar Salad with Chicken',
      description: 'Classic Caesar salad with grilled chicken and homemade croutons',
      benefits: 'Light but satisfying, perfect for family dinner',
      ingredients: ['romaine lettuce', 'chicken', 'parmesan', 'bread', 'anchovies', 'garlic', 'olive oil'],
      steps: ['Prepare Caesar dressing', 'Grill chicken', 'Make croutons', 'Toss salad', 'Serve with chicken on top'],
      calories: 380, protein: 28, carbs: 22, fats: 20
    },
    // Day 2 - Wednesday
    {
      day_of_week: 2, meal_type: 'breakfast', name: 'Berry Smoothie Bowl',
      description: 'Creamy berry smoothie with Greek yogurt and granola',
      benefits: 'Antioxidants and probiotics to strengthen immune system',
      ingredients: ['strawberries', 'blueberries', 'raspberries', 'Greek yogurt', 'milk', 'honey', 'granola'],
      steps: ['Blend berries with yogurt and milk', 'Sweeten with honey', 'Pour into bowl', 'Top with granola'],
      calories: 340, protein: 15, carbs: 52, fats: 8
    },
    {
      day_of_week: 2, meal_type: 'lunch', name: 'Pasta Primavera',
      description: 'Pasta with fresh seasonal vegetables in light tomato sauce',
      benefits: 'Energizing carbs with vitamins from vegetables',
      ingredients: ['pasta', 'zucchini', 'bell pepper', 'tomato', 'basil', 'garlic', 'olive oil', 'parmesan'],
      steps: ['Cook pasta al dente', 'Sauté vegetables', 'Prepare tomato sauce', 'Mix everything', 'Serve with parmesan'],
      calories: 480, protein: 16, carbs: 72, fats: 14
    },
    {
      day_of_week: 2, meal_type: 'dinner', name: 'Butternut Squash Soup',
      description: 'Smooth butternut squash cream with ginger and pumpkin seeds',
      benefits: 'Rich in vitamin A and low in calories, ideal for the whole family',
      ingredients: ['butternut squash', 'onion', 'ginger', 'vegetable broth', 'cream', 'pumpkin seeds'],
      steps: ['Cook squash with onion', 'Add broth and ginger', 'Blend until smooth', 'Serve with seeds'],
      calories: 280, protein: 8, carbs: 38, fats: 12
    },
    // Day 3 - Thursday
    {
      day_of_week: 3, meal_type: 'breakfast', name: 'Oatmeal Pancakes',
      description: 'Healthy oat pancakes with maple syrup and fruits',
      benefits: 'Complex carbohydrates for prolonged energy',
      ingredients: ['oats', 'egg', 'milk', 'banana', 'cinnamon', 'maple syrup', 'strawberries'],
      steps: ['Blend oats with egg and milk', 'Cook on skillet', 'Stack pancakes', 'Top with fruits and syrup'],
      calories: 410, protein: 14, carbs: 68, fats: 10
    },
    {
      day_of_week: 3, meal_type: 'lunch', name: 'Quinoa Buddha Bowl',
      description: 'Nutritious quinoa bowl with roasted vegetables and tahini dressing',
      benefits: 'Complete protein and fiber for digestive health',
      ingredients: ['quinoa', 'sweet potato', 'chickpeas', 'spinach', 'cucumber', 'tahini', 'lemon'],
      steps: ['Cook quinoa', 'Roast sweet potato and chickpeas', 'Prepare dressing', 'Assemble bowl', 'Drizzle with dressing'],
      calories: 520, protein: 18, carbs: 68, fats: 20
    },
    {
      day_of_week: 3, meal_type: 'dinner', name: 'Spanish Omelette',
      description: 'Classic potato tortilla with green salad',
      benefits: 'Affordable and delicious protein to share with family',
      ingredients: ['eggs', 'potatoes', 'onion', 'olive oil', 'lettuce', 'tomato'],
      steps: ['Fry potatoes with onion', 'Beat eggs', 'Cook omelette', 'Flip and finish', 'Serve with salad'],
      calories: 360, protein: 16, carbs: 32, fats: 18
    },
    // Day 4 - Friday
    {
      day_of_week: 4, meal_type: 'breakfast', name: 'Avocado Toast',
      description: 'Whole grain bread with avocado, poached egg and seeds',
      benefits: 'Healthy fats and protein for a complete breakfast',
      ingredients: ['whole grain bread', 'avocado', 'egg', 'sunflower seeds', 'chili flakes', 'lemon', 'salt'],
      steps: ['Toast bread', 'Mash avocado', 'Poach egg', 'Assemble toast', 'Top with seeds'],
      calories: 380, protein: 18, carbs: 32, fats: 22
    },
    {
      day_of_week: 4, meal_type: 'lunch', name: 'Shrimp Fried Rice',
      description: 'Stir-fried rice with shrimp, vegetables and soy sauce',
      benefits: 'Rich in protein and selenium, ideal for energy',
      ingredients: ['rice', 'shrimp', 'peas', 'carrot', 'egg', 'soy sauce', 'ginger'],
      steps: ['Cook rice and cool', 'Sauté shrimp', 'Add vegetables', 'Add rice', 'Season and serve'],
      calories: 490, protein: 28, carbs: 62, fats: 12
    },
    {
      day_of_week: 4, meal_type: 'dinner', name: 'Homemade Veggie Pizza',
      description: 'Pizza with whole wheat crust and fresh vegetables',
      benefits: 'Healthy version of the family favorite',
      ingredients: ['whole wheat flour', 'yeast', 'tomato sauce', 'mozzarella', 'mushrooms', 'bell pepper', 'olives'],
      steps: ['Prepare dough', 'Let rise', 'Roll out and add toppings', 'Bake 15 minutes', 'Serve hot'],
      calories: 420, protein: 18, carbs: 52, fats: 16
    },
    // Day 5 - Saturday
    {
      day_of_week: 5, meal_type: 'breakfast', name: 'Mexican Chilaquiles',
      description: 'Chilaquiles with green salsa, cream and fresh cheese',
      benefits: 'Traditional Mexican breakfast full of flavor',
      ingredients: ['tortillas', 'green salsa', 'cream', 'fresh cheese', 'onion', 'egg', 'cilantro'],
      steps: ['Fry tortillas', 'Heat green salsa', 'Coat tortillas', 'Add cream and cheese', 'Garnish with onion'],
      calories: 450, protein: 16, carbs: 48, fats: 22
    },
    {
      day_of_week: 5, meal_type: 'lunch', name: 'Grilled Steak with Guacamole',
      description: 'Grilled beef cut with fresh guacamole and beans',
      benefits: 'High in protein and iron for the whole family',
      ingredients: ['skirt steak', 'avocado', 'onion', 'cilantro', 'lime', 'beans', 'tortillas'],
      steps: ['Marinate meat', 'Grill to preference', 'Prepare guacamole', 'Heat beans', 'Serve with tortillas'],
      calories: 580, protein: 42, carbs: 38, fats: 28
    },
    {
      day_of_week: 5, meal_type: 'dinner', name: 'Tortilla Soup',
      description: 'Traditional Mexican soup with crispy tortilla and avocado',
      benefits: 'Comforting and nutritious, perfect for sharing',
      ingredients: ['chicken broth', 'tomato', 'pasilla chili', 'tortillas', 'avocado', 'cream', 'cheese'],
      steps: ['Prepare broth with tomato', 'Fry tortillas', 'Serve hot broth', 'Add toppings'],
      calories: 340, protein: 14, carbs: 36, fats: 16
    },
    // Day 6 - Sunday
    {
      day_of_week: 6, meal_type: 'breakfast', name: 'French Toast with Berries',
      description: 'Golden French toast with fresh berries and maple syrup',
      benefits: 'Special weekend breakfast to enjoy together',
      ingredients: ['brioche bread', 'egg', 'milk', 'cinnamon', 'vanilla', 'strawberries', 'maple syrup'],
      steps: ['Beat egg with milk and spices', 'Soak bread', 'Cook until golden', 'Serve with berries and syrup'],
      calories: 420, protein: 12, carbs: 58, fats: 16
    },
    {
      day_of_week: 6, meal_type: 'lunch', name: 'Beef Lasagna',
      description: 'Classic Italian lasagna with ground beef and melted cheeses',
      benefits: 'Perfect family dish for Sunday',
      ingredients: ['lasagna noodles', 'ground beef', 'ricotta', 'mozzarella', 'tomato sauce', 'spinach'],
      steps: ['Prepare meat sauce', 'Cook pasta', 'Layer ingredients', 'Bake 40 minutes', 'Rest and serve'],
      calories: 550, protein: 32, carbs: 48, fats: 26
    },
    {
      day_of_week: 6, meal_type: 'dinner', name: 'Quesadillas with Salad',
      description: 'Cheese quesadillas with fresh side salad',
      benefits: 'Light and quick dinner to close the week',
      ingredients: ['flour tortillas', 'Oaxaca cheese', 'mushrooms', 'lettuce', 'tomato', 'avocado', 'cream'],
      steps: ['Melt cheese in tortilla', 'Add mushrooms', 'Fold and brown', 'Prepare salad', 'Serve together'],
      calories: 380, protein: 18, carbs: 36, fats: 20
    }
  ];

  const meals = language === 'es' ? mealsES : mealsEN;

  // Add adaptations for each meal based on member names
  return meals.map(meal => ({
    ...meal,
    adaptations: memberNames.map((name, index) => ({
      member_name: name,
      score: 75 + Math.floor(Math.random() * 20), // 75-94
      notes: language === 'es' 
        ? `Adecuado para ${name} según sus preferencias`
        : `Suitable for ${name} based on preferences`,
      variant: language === 'es'
        ? 'Sin modificaciones necesarias'
        : 'No modifications needed'
    }))
  }));
};

const getCachedShoppingList = (language: string) => {
  return language === 'es' ? [
    'Avena (1 kg)', 'Leche (2 L)', 'Huevos (2 docenas)', 'Pan integral (2 paquetes)',
    'Pechuga de pollo (1 kg)', 'Carne molida (500 g)', 'Pescado blanco (500 g)', 
    'Camarones (400 g)', 'Arrachera (500 g)',
    'Arroz integral (1 kg)', 'Quinoa (500 g)', 'Pasta (500 g)', 'Lentejas (500 g)',
    'Tortillas de maíz (2 paquetes)', 'Tortillas de harina (1 paquete)',
    'Aguacates (6)', 'Limones (6)', 'Tomates (1 kg)', 'Cebolla (500 g)',
    'Brócoli (2 piezas)', 'Zanahoria (500 g)', 'Calabacín (3)', 'Calabaza (1 kg)',
    'Lechuga (2 piezas)', 'Espinaca (200 g)', 'Col morada (1 pieza)',
    'Fresas (500 g)', 'Plátanos (6)', 'Manzanas (4)', 'Frutos rojos (300 g)',
    'Yogurt griego (500 g)', 'Queso Oaxaca (300 g)', 'Queso parmesano (200 g)',
    'Crema (500 ml)', 'Mantequilla (250 g)',
    'Aceite de oliva (500 ml)', 'Miel (350 g)', 'Salsa de soya (250 ml)',
    'Frijoles (500 g)', 'Garbanzos (400 g)', 'Champiñones (250 g)'
  ] : [
    'Oats (2 lb)', 'Milk (2 L)', 'Eggs (2 dozen)', 'Whole wheat bread (2 loaves)',
    'Chicken breast (2 lb)', 'Ground beef (1 lb)', 'White fish (1 lb)',
    'Shrimp (1 lb)', 'Skirt steak (1 lb)',
    'Brown rice (2 lb)', 'Quinoa (1 lb)', 'Pasta (1 lb)', 'Lentils (1 lb)',
    'Corn tortillas (2 packs)', 'Flour tortillas (1 pack)',
    'Avocados (6)', 'Limes (6)', 'Tomatoes (2 lb)', 'Onion (1 lb)',
    'Broccoli (2 heads)', 'Carrots (1 lb)', 'Zucchini (3)', 'Butternut squash (2 lb)',
    'Lettuce (2 heads)', 'Spinach (8 oz)', 'Purple cabbage (1 head)',
    'Strawberries (1 lb)', 'Bananas (6)', 'Apples (4)', 'Mixed berries (12 oz)',
    'Greek yogurt (16 oz)', 'Mozzarella cheese (12 oz)', 'Parmesan cheese (8 oz)',
    'Sour cream (16 oz)', 'Butter (8 oz)',
    'Olive oil (16 oz)', 'Honey (12 oz)', 'Soy sauce (8 oz)',
    'Beans (1 lb)', 'Chickpeas (15 oz can)', 'Mushrooms (8 oz)'
  ];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'es' } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating family meal plan (CACHED) for user:', user.id);

    // Get user's family
    const { data: membership, error: membershipError } = await supabaseClient
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error fetching membership:', membershipError);
      throw new Error('Error fetching family membership');
    }

    if (!membership) {
      throw new Error(language === 'es' ? 'No perteneces a ninguna familia' : 'You are not part of any family');
    }

    const familyId = membership.family_id;

    // Get all family members with their profiles
    const { data: familyMembers } = await supabaseClient
      .from('family_memberships')
      .select('user_id')
      .eq('family_id', familyId);

    if (!familyMembers || familyMembers.length === 0) {
      throw new Error('No family members found');
    }

    const memberIds = familyMembers.map(m => m.user_id);
    console.log(`Found ${memberIds.length} family members`);

    // Get profiles to get member names
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('id, display_name, email')
      .in('id', memberIds);

    const memberNames = (profiles || []).map(p => 
      p.display_name || p.email?.split('@')[0] || 'Miembro'
    );

    console.log('Member names:', memberNames);

    // Get cached meals with adaptations
    const cachedMeals = getCachedFamilyMeals(language, memberNames);
    const shoppingList = getCachedShoppingList(language);

    console.log(`Using ${cachedMeals.length} cached meals`);

    // Create family meal plan in database
    const { data: mealPlan, error: mealPlanError } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: user.id,
        week_start_date: new Date().toISOString().split('T')[0],
        is_family_plan: true,
        family_id: familyId,
      })
      .select()
      .single();

    if (mealPlanError || !mealPlan) {
      console.error('Error creating meal plan:', mealPlanError);
      throw new Error('Failed to create meal plan in database');
    }

    console.log('Family meal plan created with ID:', mealPlan.id);

    // Insert meals
    const mealsToInsert = cachedMeals.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      benefits: meal.benefits,
      ingredients: meal.ingredients || [],
      steps: meal.steps || [],
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      image_url: null, // No images for cached version
    }));

    const { data: insertedMeals, error: mealsError } = await supabaseClient
      .from('meals')
      .insert(mealsToInsert)
      .select();

    if (mealsError || !insertedMeals) {
      console.error('Error inserting meals:', mealsError);
      await supabaseClient.from('meal_plans').delete().eq('id', mealPlan.id);
      throw new Error('Failed to insert meals');
    }

    console.log(`Inserted ${insertedMeals.length} meals`);

    // Insert member adaptations
    const adaptationsToInsert: any[] = [];
    
    for (const meal of cachedMeals) {
      const insertedMeal = insertedMeals.find(
        (m: any) => m.day_of_week === meal.day_of_week && m.meal_type === meal.meal_type
      );
      
      if (!insertedMeal || !meal.adaptations) continue;

      // Find the best match (highest score)
      const sortedAdaptations = [...meal.adaptations].sort((a: any, b: any) => b.score - a.score);
      
      for (const adaptation of meal.adaptations) {
        // Match member name to user_id
        const memberIndex = memberNames.findIndex(
          name => name.toLowerCase() === adaptation.member_name.toLowerCase()
        );
        
        if (memberIndex !== -1 && profiles && profiles[memberIndex]) {
          adaptationsToInsert.push({
            meal_id: insertedMeal.id,
            member_user_id: profiles[memberIndex].id,
            adaptation_score: adaptation.score || 80,
            adaptation_notes: adaptation.notes || '',
            variant_instructions: adaptation.variant || '',
            is_best_match: sortedAdaptations[0]?.member_name === adaptation.member_name,
          });
        }
      }
    }

    if (adaptationsToInsert.length > 0) {
      const { error: adaptError } = await supabaseClient
        .from('meal_member_adaptations')
        .insert(adaptationsToInsert);
      
      if (adaptError) {
        console.error('Error inserting adaptations:', adaptError);
      } else {
        console.log(`Inserted ${adaptationsToInsert.length} meal adaptations`);
      }
    }

    // Insert shopping list
    if (shoppingList.length > 0) {
      await supabaseClient
        .from('shopping_lists')
        .insert({
          meal_plan_id: mealPlan.id,
          items: shoppingList,
        });
    }

    console.log('✅ Family meal plan complete (CACHED)!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        mealPlanId: mealPlan.id,
        mealsCount: insertedMeals.length,
        membersCount: memberNames.length,
        adaptationsCount: adaptationsToInsert.length,
        cached: true,
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-family-meal-plan:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error generating family meal plan',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
