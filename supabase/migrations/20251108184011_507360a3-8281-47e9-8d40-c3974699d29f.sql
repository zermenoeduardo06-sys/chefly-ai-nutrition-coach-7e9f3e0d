-- Add new personalization fields to user_preferences table

-- Cooking skill level
ALTER TABLE user_preferences
ADD COLUMN cooking_skill text DEFAULT 'beginner' CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced'));

-- Budget preference
ALTER TABLE user_preferences
ADD COLUMN budget text DEFAULT 'medium' CHECK (budget IN ('low', 'medium', 'high'));

-- Cooking time preference (in minutes)
ALTER TABLE user_preferences
ADD COLUMN cooking_time integer DEFAULT 30 CHECK (cooking_time >= 10 AND cooking_time <= 120);

-- Number of people cooking for
ALTER TABLE user_preferences
ADD COLUMN servings integer DEFAULT 1 CHECK (servings >= 1 AND servings <= 10);

-- Disliked ingredients (similar to allergies)
ALTER TABLE user_preferences
ADD COLUMN dislikes text[] DEFAULT '{}';

-- Flavor preferences
ALTER TABLE user_preferences
ADD COLUMN flavor_preferences text[] DEFAULT '{}';

-- Meal complexity preference
ALTER TABLE user_preferences
ADD COLUMN meal_complexity text DEFAULT 'simple' CHECK (meal_complexity IN ('simple', 'moderate', 'complex'));

-- Preferred cuisines
ALTER TABLE user_preferences
ADD COLUMN preferred_cuisines text[] DEFAULT '{}';

-- Activity level for better calorie calculation
ALTER TABLE user_preferences
ADD COLUMN activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'));

-- Age and weight for better personalization (optional)
ALTER TABLE user_preferences
ADD COLUMN age integer CHECK (age IS NULL OR (age >= 10 AND age <= 120));

ALTER TABLE user_preferences
ADD COLUMN weight integer CHECK (weight IS NULL OR (weight >= 30 AND weight <= 300));

-- Gender for better calorie calculations (optional)
ALTER TABLE user_preferences
ADD COLUMN gender text CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));

-- Comments or additional preferences
ALTER TABLE user_preferences
ADD COLUMN additional_notes text;