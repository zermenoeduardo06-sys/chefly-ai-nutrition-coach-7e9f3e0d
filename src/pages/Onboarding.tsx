import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Target, Salad, Activity, User, ChefHat, Wallet, Utensils, Heart, Globe, AlertCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingOption from "@/components/onboarding/OnboardingOption";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import OnboardingStepWrapper from "@/components/onboarding/OnboardingStepWrapper";
import OnboardingBadgeSelector from "@/components/onboarding/OnboardingBadgeSelector";
import OnboardingCelebration from "@/components/onboarding/OnboardingCelebration";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import cheflyLogo from "@/assets/chefly-logo.png";
import { clearAllShoppingListCaches } from "@/utils/shoppingListCache";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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
    { value: "lose_fat", labelKey: "onboarding.goal.loseFat" },
    { value: "gain_muscle", labelKey: "onboarding.goal.gainMuscle" },
    { value: "eat_healthy", labelKey: "onboarding.goal.eatHealthy" },
    { value: "save_money", labelKey: "onboarding.goal.saveMoney" },
  ];

  const diets = [
    { value: "omnivore", labelKey: "onboarding.diet.omnivore" },
    { value: "vegetarian", labelKey: "onboarding.diet.vegetarian" },
    { value: "vegan", labelKey: "onboarding.diet.vegan" },
    { value: "keto", labelKey: "onboarding.diet.keto" },
    { value: "paleo", labelKey: "onboarding.diet.paleo" },
  ];

  const cookingSkills = [
    { value: "beginner", labelKey: "onboarding.cooking.beginner" },
    { value: "intermediate", labelKey: "onboarding.cooking.intermediate" },
    { value: "advanced", labelKey: "onboarding.cooking.advanced" },
  ];

  const budgets = [
    { value: "low", labelKey: "onboarding.budget.low" },
    { value: "medium", labelKey: "onboarding.budget.medium" },
    { value: "high", labelKey: "onboarding.budget.high" },
  ];

  const activityLevels = [
    { value: "sedentary", labelKey: "onboarding.activity.sedentary" },
    { value: "light", labelKey: "onboarding.activity.light" },
    { value: "moderate", labelKey: "onboarding.activity.moderate" },
    { value: "active", labelKey: "onboarding.activity.active" },
    { value: "very_active", labelKey: "onboarding.activity.veryActive" },
  ];

  const flavors = [
    { value: "Dulce", labelKey: "onboarding.flavor.sweet" },
    { value: "Salado", labelKey: "onboarding.flavor.salty" },
    { value: "Picante", labelKey: "onboarding.flavor.spicy" },
    { value: "Ácido", labelKey: "onboarding.flavor.sour" },
    { value: "Umami", labelKey: "onboarding.flavor.umami" },
    { value: "Amargo", labelKey: "onboarding.flavor.bitter" },
  ];
  
  const cuisines = [
    { value: "Mexicana", labelKey: "onboarding.cuisine.mexican" },
    { value: "Italiana", labelKey: "onboarding.cuisine.italian" },
    { value: "Asiática", labelKey: "onboarding.cuisine.asian" },
    { value: "Mediterránea", labelKey: "onboarding.cuisine.mediterranean" },
    { value: "Americana", labelKey: "onboarding.cuisine.american" },
    { value: "Vegetariana", labelKey: "onboarding.cuisine.vegetarian" },
    { value: "Saludable", labelKey: "onboarding.cuisine.healthy" },
  ];

  const complexities = [
    { value: "simple", labelKey: "onboarding.complexitySimple" },
    { value: "moderate", labelKey: "onboarding.complexityModerate" },
    { value: "complex", labelKey: "onboarding.complexityComplex" },
  ];

  const addAllergy = () => {
    const trimmedInput = allergyInput.trim();
    
    if (!trimmedInput) return;
    
    if (trimmedInput.length > 100) {
      toast({
        variant: "destructive",
        title: t("onboarding.allergies.tooLong"),
        description: t("onboarding.allergies.tooLongDesc"),
      });
      return;
    }
    
    const allergyRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    if (!allergyRegex.test(trimmedInput)) {
      toast({
        variant: "destructive",
        title: t("onboarding.allergies.invalid"),
        description: t("onboarding.allergies.invalidDesc"),
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
        title: t("onboarding.allergies.tooLong"),
        description: t("onboarding.allergies.tooLongDesc"),
      });
      return;
    }
    
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    if (!regex.test(trimmedInput)) {
      toast({
        variant: "destructive",
        title: t("onboarding.allergies.invalid"),
        description: t("onboarding.allergies.invalidDesc"),
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

  const toggleFlavor = (value: string) => {
    if (flavorPreferences.includes(value)) {
      setFlavorPreferences(flavorPreferences.filter(f => f !== value));
    } else {
      setFlavorPreferences([...flavorPreferences, value]);
    }
  };

  const toggleCuisine = (value: string) => {
    if (preferredCuisines.includes(value)) {
      setPreferredCuisines(preferredCuisines.filter(c => c !== value));
    } else {
      setPreferredCuisines([...preferredCuisines, value]);
    }
  };

  const handleSubmit = async () => {
    if (!goal || !dietType) {
      toast({
        variant: "destructive",
        title: t("onboarding.toast.requiredFields"),
        description: t("onboarding.toast.requiredFieldsDesc"),
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
        title: t("onboarding.toast.perfect"),
        description: t("onboarding.toast.generating"),
      });

      // Generate the first meal plan automatically
      const { data, error: functionError } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId: user.id },
      });

      if (functionError) {
        console.error("Error generating meal plan:", functionError);
        toast({
          variant: "destructive",
          title: t("onboarding.toast.errorGenerating"),
          description: t("onboarding.toast.errorGeneratingDesc"),
        });
      } else {
        // Clear shopping list cache for the new plan
        clearAllShoppingListCaches();
        
        toast({
          title: t("onboarding.toast.created"),
          description: t("onboarding.toast.createdDesc"),
        });
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: t("onboarding.toast.error"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const [showCelebration, setShowCelebration] = useState(false);

  // Icons for goals
  const goalIcons: Record<string, any> = {
    lose_fat: Target,
    gain_muscle: Activity,
    eat_healthy: Heart,
    save_money: Wallet,
  };

  // Icons for diets
  const dietIcons: Record<string, any> = {
    omnivore: Utensils,
    vegetarian: Salad,
    vegan: Salad,
    keto: Target,
    paleo: Globe,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      {/* Celebration overlay */}
      <OnboardingCelebration 
        show={showCelebration} 
        message={t("onboarding.toast.perfect")}
        onComplete={() => setShowCelebration(false)}
      />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Language Toggle - Top Right */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        {/* Header with logo */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <img src={cheflyLogo} alt="Chefly.AI" className="h-10 w-10" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                {t("onboarding.title")}
              </span>
            </h1>
          </motion.div>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("onboarding.subtitle")}
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        <OnboardingProgress currentStep={step} totalSteps={10} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-2xl border-border/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="text-lg">{t("onboarding.step", { current: step, total: 10 })}</CardTitle>
                  <CardDescription>{t("onboarding.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Step 1: Goal */}
            {step === 1 && (
              <OnboardingStepWrapper
                step={1}
                title={t("onboarding.goal.title")}
                onSelectionMade={!!goal}
              >
                <div className="space-y-3">
                  {goals.map((g, index) => (
                    <OnboardingOption
                      key={g.value}
                      value={g.value}
                      label={t(g.labelKey)}
                      isSelected={goal === g.value}
                      onSelect={setGoal}
                      icon={goalIcons[g.value]}
                      index={index}
                    />
                  ))}
                </div>
              </OnboardingStepWrapper>
            )}

            {/* Step 2: Diet Type */}
            {step === 2 && (
              <OnboardingStepWrapper
                step={2}
                title={t("onboarding.diet.title")}
                onSelectionMade={!!dietType}
              >
                <div className="space-y-3">
                  {diets.map((d, index) => (
                    <OnboardingOption
                      key={d.value}
                      value={d.value}
                      label={t(d.labelKey)}
                      isSelected={dietType === d.value}
                      onSelect={setDietType}
                      icon={dietIcons[d.value]}
                      index={index}
                    />
                  ))}
                </div>
              </OnboardingStepWrapper>
            )}

            {/* Step 3: Activity Level */}
            {step === 3 && (
              <OnboardingStepWrapper
                step={3}
                title={t("onboarding.activity.title")}
                description={t("onboarding.activity.description")}
                onSelectionMade={!!activityLevel}
              >
                <div className="space-y-3">
                  {activityLevels.map((level, index) => (
                    <OnboardingOption
                      key={level.value}
                      value={level.value}
                      label={t(level.labelKey)}
                      isSelected={activityLevel === level.value}
                      onSelect={setActivityLevel}
                      index={index}
                    />
                  ))}
                </div>
              </OnboardingStepWrapper>
            )}

            {/* Step 4: Personal Info (Optional) */}
            {step === 4 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-lg font-semibold">{t("onboarding.personal.title")}</Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.personal.description")}</p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="age">{t("onboarding.personal.age")}</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder={t("onboarding.personal.agePlaceholder")}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="10"
                      max="120"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">{t("onboarding.personal.weight")}</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder={t("onboarding.personal.weightPlaceholder")}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min="30"
                      max="300"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base">{t("onboarding.personal.gender")}</Label>
                    <RadioGroup value={gender} onValueChange={setGender}>
                      <motion.div 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={gender === "male" ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer flex-1">{t("onboarding.personal.male")}</Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={gender === "female" ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer flex-1">{t("onboarding.personal.female")}</Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={gender === "other" ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer flex-1">{t("onboarding.personal.other")}</Label>
                      </motion.div>
                    </RadioGroup>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Cooking Skill */}
            {step === 5 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-lg font-semibold">{t("onboarding.cooking.title")}</Label>
                <RadioGroup value={cookingSkill} onValueChange={setCookingSkill}>
                  {cookingSkills.map((skill) => (
                    <motion.div 
                      key={skill.value} 
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={cookingSkill === skill.value ? { scale: 1.02, borderColor: "hsl(var(--primary))" } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      <RadioGroupItem value={skill.value} id={skill.value} />
                      <Label htmlFor={skill.value} className="cursor-pointer flex-1 text-base">
                        {t(skill.labelKey)}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 6: Budget & Time */}
            {step === 6 && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">{t("onboarding.budget.title")}</Label>
                  <RadioGroup value={budget} onValueChange={setBudget}>
                    {budgets.map((b) => (
                      <motion.div 
                        key={b.value} 
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={budget === b.value ? { scale: 1.02, borderColor: "hsl(var(--primary))" } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        <RadioGroupItem value={b.value} id={b.value} />
                        <Label htmlFor={b.value} className="cursor-pointer flex-1 text-base">
                          {t(b.labelKey)}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("onboarding.time.title")}</Label>
                  <RadioGroup value={cookingTime} onValueChange={setCookingTime}>
                    {["15", "30", "45", "60"].map((time) => (
                      <motion.div 
                        key={time} 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={cookingTime === time ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value={time} id={`time-${time}`} />
                        <Label htmlFor={`time-${time}`} className="cursor-pointer flex-1">
                          {t("onboarding.time.minutes", { time })}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* Step 7: Meals & Servings */}
            {step === 7 && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">{t("onboarding.meals.title")}</Label>
                  <RadioGroup value={mealsPerDay} onValueChange={setMealsPerDay}>
                    {["2", "3", "4", "5"].map((num) => (
                      <motion.div 
                        key={num} 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={mealsPerDay === num ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value={num} id={`meals-${num}`} />
                        <Label htmlFor={`meals-${num}`} className="cursor-pointer flex-1">
                          {t("onboarding.meals.count", { count: num })}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("onboarding.servings.title")}</Label>
                  <RadioGroup value={servings} onValueChange={setServings}>
                    {["1", "2", "3", "4", "5+"].map((num) => (
                      <motion.div 
                        key={num} 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={servings === (num === "5+" ? "5" : num) ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value={num === "5+" ? "5" : num} id={`servings-${num}`} />
                        <Label htmlFor={`servings-${num}`} className="cursor-pointer flex-1">
                          {num === "1" ? t("onboarding.servings.person", { count: num }) : t("onboarding.servings.people", { count: num })}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("onboarding.complexityTitle")}</Label>
                  <RadioGroup value={mealComplexity} onValueChange={setMealComplexity}>
                    {complexities.map((c) => (
                      <motion.div 
                        key={c.value} 
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={mealComplexity === c.value ? { scale: 1.02 } : {}}
                      >
                        <RadioGroupItem value={c.value} id={c.value} />
                        <Label htmlFor={c.value} className="cursor-pointer flex-1">
                          {t(c.labelKey)}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* Step 8: Flavor Preferences */}
            {step === 8 && (
              <OnboardingStepWrapper
                step={8}
                title={t("onboarding.flavors.title")}
                description={t("onboarding.flavors.description")}
                onSelectionMade={flavorPreferences.length > 0}
              >
                <OnboardingBadgeSelector
                  options={flavors.map(f => ({ value: f.value, label: t(f.labelKey) }))}
                  selected={flavorPreferences}
                  onToggle={toggleFlavor}
                />
              </OnboardingStepWrapper>
            )}

            {/* Step 9: Cuisine Preferences */}
            {step === 9 && (
              <OnboardingStepWrapper
                step={9}
                title={t("onboarding.cuisines.title")}
                description={t("onboarding.cuisines.description")}
                onSelectionMade={preferredCuisines.length > 0}
              >
                <OnboardingBadgeSelector
                  options={cuisines.map(c => ({ value: c.value, label: t(c.labelKey) }))}
                  selected={preferredCuisines}
                  onToggle={toggleCuisine}
                />
              </OnboardingStepWrapper>
            )}

            {/* Step 10: Allergies & Dislikes */}
            {step === 10 && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">{t("onboarding.allergies.title")}</Label>
                  <p className="text-sm text-muted-foreground">{t("onboarding.allergies.description")}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("onboarding.allergies.placeholder")}
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                    />
                    <Button type="button" onClick={addAllergy} variant="outline">{t("onboarding.allergies.add")}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((allergy) => (
                      <motion.div
                        key={allergy}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {allergy}
                          <X
                            className="ml-2 h-3 w-3 cursor-pointer"
                            onClick={() => removeAllergy(allergy)}
                          />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("onboarding.dislikes.title")}</Label>
                  <p className="text-sm text-muted-foreground">{t("onboarding.dislikes.description")}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("onboarding.dislikes.placeholder")}
                      value={dislikeInput}
                      onChange={(e) => setDislikeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDislike())}
                    />
                    <Button type="button" onClick={addDislike} variant="outline">{t("onboarding.allergies.add")}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dislikes.map((dislike) => (
                      <motion.div
                        key={dislike}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {dislike}
                          <X
                            className="ml-2 h-3 w-3 cursor-pointer"
                            onClick={() => removeDislike(dislike)}
                          />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("onboarding.notes.title")}</Label>
                  <Textarea
                    placeholder={t("onboarding.notes.placeholder")}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">{additionalNotes.length}/500</p>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="flex gap-3 pt-6 border-t border-border/50 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {step > 1 && (
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                    className="w-full h-12"
                  >
                    {t("onboarding.buttons.back")}
                  </Button>
                </motion.div>
              )}
              {step < 10 ? (
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={loading || (step === 1 && !goal) || (step === 2 && !dietType)}
                    className="w-full h-12 text-base font-semibold"
                    variant="hero"
                  >
                    <span className="flex items-center gap-2">
                      {t("onboarding.buttons.next")}
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      setShowCelebration(true);
                      setTimeout(() => {
                        setShowCelebration(false);
                        handleSubmit();
                      }, 2500);
                    }}
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold"
                    variant="hero"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("onboarding.buttons.creating")}
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {t("onboarding.buttons.create")}
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
