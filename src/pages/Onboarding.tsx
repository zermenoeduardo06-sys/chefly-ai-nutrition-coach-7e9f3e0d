import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");

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

  const addAllergy = () => {
    const trimmedInput = allergyInput.trim();
    
    // Validate allergy input
    if (!trimmedInput) return;
    
    if (trimmedInput.length > 100) {
      toast({
        variant: "destructive",
        title: "Entrada muy larga",
        description: "La alergia no puede tener más de 100 caracteres",
      });
      return;
    }
    
    // Only allow letters, spaces, and common accented characters
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

      // First, save or update user preferences
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("user_preferences")
          .update({
            goal,
            diet_type: dietType,
            meals_per_day: parseInt(mealsPerDay),
            allergies,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new preferences
        const { error } = await supabase.from("user_preferences").insert({
          user_id: user.id,
          goal,
          diet_type: dietType,
          meals_per_day: parseInt(mealsPerDay),
          allergies,
        });

        if (error) throw error;
      }

      toast({
        title: "¡Perfecto!",
        description: "Generando tu primer menú semanal...",
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
            <CardTitle>Paso {step} de 4</CardTitle>
            <CardDescription>
              Esta información nos ayudará a personalizar tus menús
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {step === 3 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Cuántas comidas haces al día?</Label>
                <RadioGroup value={mealsPerDay} onValueChange={setMealsPerDay}>
                  {["2", "3", "4", "5"].map((num) => (
                    <div key={num} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={num} id={`meals-${num}`} />
                      <Label htmlFor={`meals-${num}`} className="cursor-pointer flex-1 text-base">
                        {num} comidas
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Tienes alguna alergia o restricción?</Label>
                <p className="text-sm text-muted-foreground">Opcional, pero nos ayuda a evitar ingredientes</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Lactosa, gluten, nueces..."
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" onClick={addAllergy}>Agregar</Button>
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
              {step < 4 ? (
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
                    "Crear mi plan"
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
