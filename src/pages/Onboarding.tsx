import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic info
  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  
  // New personalization fields
  const [cookingSkill, setCookingSkill] = useState("beginner");
  const [budget, setBudget] = useState("medium");
  const [cookingTime, setCookingTime] = useState("30");
  const [servings, setServings] = useState("1");
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState("");
  const [flavorPreferences, setFlavorPreferences] = useState<string[]>([]);
  const [mealComplexity, setMealComplexity] = useState("simple");
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const goals = [
    { value: "lose_fat", label: "Bajar grasa" },
    { value: "gain_muscle", label: "Ganar músculo" },
    { value: "eat_healthy", label: "Comer saludable" },
    { value: "save_money", label: "Comer barato" },
  ];

  const diets = [
    { value: "omnivore", label: "Omnívora" },
    { value: "vegetarian", label: "Vegetariana" },
    { value: "vegan", label: "Vegana" },
    { value: "keto", label: "Keto" },
    { value: "paleo", label: "Paleo" },
  ];

  const cookingSkills = [
    { value: "beginner", label: "Principiante - Recetas simples" },
    { value: "intermediate", label: "Intermedio - Puedo seguir la mayoría de recetas" },
    { value: "advanced", label: "Avanzado - Me gusta cocinar platos complejos" },
  ];

  const budgets = [
    { value: "low", label: "Bajo - Ingredientes económicos" },
    { value: "medium", label: "Medio - Balance entre precio y calidad" },
    { value: "high", label: "Alto - Ingredientes premium" },
  ];

  const activityLevels = [
    { value: "sedentary", label: "Sedentario - Poco o ningún ejercicio" },
    { value: "light", label: "Ligero - Ejercicio 1-2 días/semana" },
    { value: "moderate", label: "Moderado - Ejercicio 3-5 días/semana" },
    { value: "active", label: "Activo - Ejercicio 6-7 días/semana" },
    { value: "very_active", label: "Muy activo - Ejercicio intenso diario" },
  ];

  const flavors = ["Dulce", "Salado", "Picante", "Ácido", "Umami", "Amargo"];
  
  const cuisines = ["Mexicana", "Italiana", "Asiática", "Mediterránea", "Americana", "Vegetariana", "Saludable"];

  const complexities = [
    { value: "simple", label: "Simple - Pocos pasos y ingredientes" },
    { value: "moderate", label: "Moderado - Recetas estándar" },
    { value: "complex", label: "Complejo - Recetas elaboradas" },
  ];

  const addAllergy = () => {
    const trimmedInput = allergyInput.trim();
    
    if (!trimmedInput) return;
    
    if (trimmedInput.length > 100) {
      toast({
        variant: "destructive",
        title: "Entrada muy larga",
        description: "La alergia no puede tener más de 100 caracteres",
      });
      return;
    }
    
    const allergyRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    if (!allergyRegex.test(trimmedInput)) {
      toast({
        variant: "destructive",
        title: "Entrada inválida",
        description: "Solo se permiten letras y espacios",
      });
      return;
    }
    
    if (!allergies.includes(trimmedInput)) {
      setAllergies([...allergies, trimmedInput]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const addDislike = () => {
    const trimmedInput = dislikeInput.trim();
    if (!trimmedInput) return;
    
    if (trimmedInput.length > 100) {
      toast({
        variant: "destructive",
        title: "Entrada muy larga",
        description: "El ingrediente no puede tener más de 100 caracteres",
      });
      return;
    }
    
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    if (!regex.test(trimmedInput)) {
      toast({
        variant: "destructive",
        title: "Entrada inválida",
        description: "Solo se permiten letras y espacios",
      });
      return;
    }
    
    if (!dislikes.includes(trimmedInput)) {
      setDislikes([...dislikes, trimmedInput]);
      setDislikeInput("");
    }
  };

  const removeDislike = (dislike: string) => {
    setDislikes(dislikes.filter((d) => d !== dislike));
  };

  const toggleFlavor = (flavor: string) => {
    if (flavorPreferences.includes(flavor)) {
      setFlavorPreferences(flavorPreferences.filter(f => f !== flavor));
    } else {
      setFlavorPreferences([...flavorPreferences, flavor]);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (preferredCuisines.includes(cuisine)) {
      setPreferredCuisines(preferredCuisines.filter(c => c !== cuisine));
    } else {
      setPreferredCuisines([...preferredCuisines, cuisine]);
    }
  };

  const handleSubmit = async () => {
    if (!goal || !dietType) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Prepare preferences object with all fields
      const preferences = {
        goal,
        diet_type: dietType,
        meals_per_day: parseInt(mealsPerDay),
        allergies,
        cooking_skill: cookingSkill,
        budget,
        cooking_time: parseInt(cookingTime),
        servings: parseInt(servings),
        dislikes,
        flavor_preferences: flavorPreferences,
        meal_complexity: mealComplexity,
        preferred_cuisines: preferredCuisines,
        activity_level: activityLevel,
        age: age ? parseInt(age) : null,
        weight: weight ? parseInt(weight) : null,
        gender: gender || null,
        additional_notes: additionalNotes || null,
      };

      // First, check if user preferences exist
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("user_preferences")
          .update(preferences)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new preferences
        const { error } = await supabase.from("user_preferences").insert({
          user_id: user.id,
          ...preferences,
        });

        if (error) throw error;
      }

      toast({
        title: "¡Perfecto!",
        description: "Generando tu primer menú semanal personalizado...",
      });

      // Generate the first meal plan automatically
      const { data, error: functionError } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId: user.id },
      });

      if (functionError) {
        console.error("Error generating meal plan:", functionError);
        toast({
          variant: "destructive",
          title: "Error al generar el menú",
          description: "Podrás generarlo manualmente desde el dashboard",
        });
      } else {
        toast({
          title: "¡Menú creado!",
          description: "Tu plan semanal personalizado está listo",
        });
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Personaliza tu experiencia
            </span>
          </h1>
          <p className="text-muted-foreground">
            Cuéntanos sobre ti para crear tu plan perfecto
          </p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <CardTitle>Paso {step} de 10</CardTitle>
            <CardDescription>
              Esta información nos ayudará a personalizar tus menús
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Goal */}
            {step === 1 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Cuál es tu objetivo principal?</Label>
                <RadioGroup value={goal} onValueChange={setGoal}>
                  {goals.map((g) => (
                    <div key={g.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={g.value} id={g.value} />
                      <Label htmlFor={g.value} className="cursor-pointer flex-1 text-base">
                        {g.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Diet Type */}
            {step === 2 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Qué tipo de dieta prefieres?</Label>
                <RadioGroup value={dietType} onValueChange={setDietType}>
                  {diets.map((d) => (
                    <div key={d.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={d.value} id={d.value} />
                      <Label htmlFor={d.value} className="cursor-pointer flex-1 text-base">
                        {d.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Activity Level */}
            {step === 3 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Cuál es tu nivel de actividad física?</Label>
                <p className="text-sm text-muted-foreground">Esto nos ayuda a calcular mejor tus necesidades calóricas</p>
                <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
                  {activityLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value} className="cursor-pointer flex-1 text-base">
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 4: Personal Info (Optional) */}
            {step === 4 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Información personal (opcional)</Label>
                <p className="text-sm text-muted-foreground">Esto nos ayuda a calcular mejor tus necesidades nutricionales</p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Ej: 25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="10"
                      max="120"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ej: 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min="30"
                      max="300"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base">Género</Label>
                    <RadioGroup value={gender} onValueChange={setGender}>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer flex-1">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer flex-1">Femenino</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer flex-1">Otro</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Cooking Skill */}
            {step === 5 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Cuál es tu nivel de experiencia cocinando?</Label>
                <RadioGroup value={cookingSkill} onValueChange={setCookingSkill}>
                  {cookingSkills.map((skill) => (
                    <div key={skill.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={skill.value} id={skill.value} />
                      <Label htmlFor={skill.value} className="cursor-pointer flex-1 text-base">
                        {skill.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 6: Budget & Time */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">¿Cuál es tu presupuesto para comida?</Label>
                  <RadioGroup value={budget} onValueChange={setBudget}>
                    {budgets.map((b) => (
                      <div key={b.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={b.value} id={b.value} />
                        <Label htmlFor={b.value} className="cursor-pointer flex-1 text-base">
                          {b.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">¿Cuánto tiempo puedes cocinar por comida? (minutos)</Label>
                  <RadioGroup value={cookingTime} onValueChange={setCookingTime}>
                    {["15", "30", "45", "60"].map((time) => (
                      <div key={time} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={time} id={`time-${time}`} />
                        <Label htmlFor={`time-${time}`} className="cursor-pointer flex-1">
                          {time} minutos
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 7: Meals & Servings */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">¿Cuántas comidas haces al día?</Label>
                  <RadioGroup value={mealsPerDay} onValueChange={setMealsPerDay}>
                    {["2", "3", "4", "5"].map((num) => (
                      <div key={num} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={num} id={`meals-${num}`} />
                        <Label htmlFor={`meals-${num}`} className="cursor-pointer flex-1">
                          {num} comidas
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">¿Para cuántas personas cocinas?</Label>
                  <RadioGroup value={servings} onValueChange={setServings}>
                    {["1", "2", "3", "4", "5+"].map((num) => (
                      <div key={num} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={num === "5+" ? "5" : num} id={`servings-${num}`} />
                        <Label htmlFor={`servings-${num}`} className="cursor-pointer flex-1">
                          {num} {num === "1" ? "persona" : "personas"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Complejidad de las recetas</Label>
                  <RadioGroup value={mealComplexity} onValueChange={setMealComplexity}>
                    {complexities.map((c) => (
                      <div key={c.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <RadioGroupItem value={c.value} id={c.value} />
                        <Label htmlFor={c.value} className="cursor-pointer flex-1">
                          {c.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 8: Flavor Preferences */}
            {step === 8 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Qué sabores te gustan?</Label>
                <p className="text-sm text-muted-foreground">Selecciona todos los que apliquen</p>
                <div className="grid grid-cols-2 gap-3">
                  {flavors.map((flavor) => (
                    <Badge
                      key={flavor}
                      variant={flavorPreferences.includes(flavor) ? "default" : "outline"}
                      className="px-4 py-3 text-sm cursor-pointer justify-center hover:opacity-80 transition-opacity"
                      onClick={() => toggleFlavor(flavor)}
                    >
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Cuisine Preferences */}
            {step === 9 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Qué tipos de cocina prefieres?</Label>
                <p className="text-sm text-muted-foreground">Selecciona todos los que te gusten</p>
                <div className="grid grid-cols-2 gap-3">
                  {cuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      variant={preferredCuisines.includes(cuisine) ? "default" : "outline"}
                      className="px-4 py-3 text-sm cursor-pointer justify-center hover:opacity-80 transition-opacity"
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Step 10: Allergies & Dislikes */}
            {step === 10 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">¿Tienes alergias?</Label>
                  <p className="text-sm text-muted-foreground">Nos ayuda a evitar estos ingredientes</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Lactosa, gluten, nueces..."
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                    />
                    <Button type="button" onClick={addAllergy} variant="outline">Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((allergy) => (
                      <Badge key={allergy} variant="secondary" className="px-3 py-1 text-sm">
                        {allergy}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => removeAllergy(allergy)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">¿Hay ingredientes que no te gusten?</Label>
                  <p className="text-sm text-muted-foreground">Opcional - Nos ayuda a personalizar mejor</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Brócoli, cilantro, champiñones..."
                      value={dislikeInput}
                      onChange={(e) => setDislikeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDislike())}
                    />
                    <Button type="button" onClick={addDislike} variant="outline">Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dislikes.map((dislike) => (
                      <Badge key={dislike} variant="secondary" className="px-3 py-1 text-sm">
                        {dislike}
                        <X
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={() => removeDislike(dislike)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Comentarios adicionales (opcional)</Label>
                  <Textarea
                    placeholder="¿Algo más que debamos saber? Ej: Horarios preferidos, alimentos favoritos, etc."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">{additionalNotes.length}/500</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Atrás
                </Button>
              )}
              {step < 10 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={loading || (step === 1 && !goal) || (step === 2 && !dietType)}
                  className="flex-1"
                  variant="hero"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                  variant="hero"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Crear mi plan personalizado"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
