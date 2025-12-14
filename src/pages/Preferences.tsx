import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, X, Save, Target, Salad, Activity, ChefHat, Wallet, Clock, Users, Sparkles, Heart, Globe, Utensils } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import OnboardingOption from "@/components/onboarding/OnboardingOption";
import OnboardingBadgeSelector from "@/components/onboarding/OnboardingBadgeSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Form state
  const [goal, setGoal] = useState("");
  const [dietType, setDietType] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
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

  // Options
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
  ];

  const complexities = [
    { value: "simple", labelKey: "onboarding.complexitySimple" },
    { value: "moderate", labelKey: "onboarding.complexityModerate" },
    { value: "complex", labelKey: "onboarding.complexityComplex" },
  ];

  const goalIcons: Record<string, any> = {
    lose_fat: Target,
    gain_muscle: Activity,
    eat_healthy: Heart,
    save_money: Wallet,
  };

  const dietIcons: Record<string, any> = {
    omnivore: Utensils,
    vegetarian: Salad,
    vegan: Salad,
    keto: Target,
    paleo: Globe,
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setGoal(data.goal || "");
        setDietType(data.diet_type || "");
        setMealsPerDay(String(data.meals_per_day || 3));
        setAllergies(data.allergies || []);
        setCookingSkill(data.cooking_skill || "beginner");
        setBudget(data.budget || "medium");
        setCookingTime(String(data.cooking_time || 30));
        setServings(String(data.servings || 1));
        setDislikes(data.dislikes || []);
        setFlavorPreferences(data.flavor_preferences || []);
        setMealComplexity(data.meal_complexity || "simple");
        setPreferredCuisines(data.preferred_cuisines || []);
        setActivityLevel(data.activity_level || "moderate");
        setAge(data.age ? String(data.age) : "");
        setWeight(data.weight ? String(data.weight) : "");
        setGender(data.gender || "");
        setAdditionalNotes(data.additional_notes || "");
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setAllergyInput("");
    }
  };

  const addDislike = () => {
    const trimmed = dislikeInput.trim();
    if (trimmed && !dislikes.includes(trimmed)) {
      setDislikes([...dislikes, trimmed]);
      setDislikeInput("");
    }
  };

  const toggleFlavor = (value: string) => {
    setFlavorPreferences(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    );
  };

  const toggleCuisine = (value: string) => {
    setPreferredCuisines(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    if (!goal || !dietType) {
      toast({
        variant: "destructive",
        title: t("onboarding.toast.requiredFields"),
        description: t("onboarding.toast.requiredFieldsDesc"),
      });
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

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

      const { error } = await supabase
        .from("user_preferences")
        .update(preferences)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("preferences.saved"),
        description: t("preferences.savedDesc"),
      });

      navigate("/dashboard/settings");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("preferences.title")}</h1>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Goal Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {t("onboarding.goal.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Diet Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Salad className="w-4 h-4 text-primary" />
              {t("onboarding.diet.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t("onboarding.activity.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {t(level.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("onboarding.personal.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("onboarding.personal.age")}</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label>{t("onboarding.personal.weight")}</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>
            <div>
              <Label>{t("onboarding.personal.gender")}</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder={t("onboarding.personal.genderPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("onboarding.personal.male")}</SelectItem>
                  <SelectItem value="female">{t("onboarding.personal.female")}</SelectItem>
                  <SelectItem value="other">{t("onboarding.personal.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cooking Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              {t("preferences.cooking")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("onboarding.cooking.title")}</Label>
              <Select value={cookingSkill} onValueChange={setCookingSkill}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cookingSkills.map(skill => (
                    <SelectItem key={skill.value} value={skill.value}>
                      {t(skill.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("onboarding.complexity")}</Label>
              <Select value={mealComplexity} onValueChange={setMealComplexity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complexities.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t("onboarding.time.title")}
                </Label>
                <Input
                  type="number"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  min="10"
                  max="180"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {t("onboarding.servings.title")}
                </Label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              {t("onboarding.budget.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {budgets.map(b => (
                  <SelectItem key={b.value} value={b.value}>
                    {t(b.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Meals per day */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("onboarding.meals.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {t("onboarding.meals.meals")}</SelectItem>
                <SelectItem value="3">3 {t("onboarding.meals.meals")}</SelectItem>
                <SelectItem value="4">4 {t("onboarding.meals.meals")}</SelectItem>
                <SelectItem value="5">5 {t("onboarding.meals.meals")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("onboarding.allergies.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder={t("onboarding.allergies.placeholder")}
                onKeyPress={(e) => e.key === "Enter" && addAllergy()}
              />
              <Button onClick={addAllergy} variant="secondary" size="sm">
                {t("common.add")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy} variant="secondary" className="gap-1">
                  {allergy}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setAllergies(allergies.filter(a => a !== allergy))} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dislikes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("onboarding.dislikes.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={dislikeInput}
                onChange={(e) => setDislikeInput(e.target.value)}
                placeholder={t("onboarding.dislikes.placeholder")}
                onKeyPress={(e) => e.key === "Enter" && addDislike()}
              />
              <Button onClick={addDislike} variant="secondary" size="sm">
                {t("common.add")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike) => (
                <Badge key={dislike} variant="secondary" className="gap-1">
                  {dislike}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDislikes(dislikes.filter(d => d !== dislike))} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flavor Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t("onboarding.flavors.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingBadgeSelector
              options={flavors.map(f => ({ value: f.value, label: t(f.labelKey) }))}
              selected={flavorPreferences}
              onToggle={toggleFlavor}
            />
          </CardContent>
        </Card>

        {/* Cuisines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {t("onboarding.cuisines.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingBadgeSelector
              options={cuisines.map(c => ({ value: c.value, label: t(c.labelKey) }))}
              selected={preferredCuisines}
              onToggle={toggleCuisine}
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("onboarding.notes.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t("onboarding.notes.placeholder")}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
};

export default Preferences;
