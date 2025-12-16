import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ShoppingItemProps {
  ingredient: string;
  isPurchased: boolean;
  onToggle: () => void;
}

// Map ingredients to emojis
const getIngredientEmoji = (ingredient: string): string => {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Proteins
  if (lowerIngredient.includes('pollo') || lowerIngredient.includes('chicken')) return '🍗';
  if (lowerIngredient.includes('carne') || lowerIngredient.includes('beef') || lowerIngredient.includes('res')) return '🥩';
  if (lowerIngredient.includes('cerdo') || lowerIngredient.includes('pork')) return '🥓';
  if (lowerIngredient.includes('pescado') || lowerIngredient.includes('fish') || lowerIngredient.includes('salmón') || lowerIngredient.includes('salmon') || lowerIngredient.includes('atún') || lowerIngredient.includes('tuna')) return '🐟';
  if (lowerIngredient.includes('camarón') || lowerIngredient.includes('shrimp')) return '🦐';
  if (lowerIngredient.includes('huevo') || lowerIngredient.includes('egg')) return '🥚';
  if (lowerIngredient.includes('tocino') || lowerIngredient.includes('bacon')) return '🥓';
  if (lowerIngredient.includes('jamón') || lowerIngredient.includes('ham')) return '🍖';
  
  // Dairy
  if (lowerIngredient.includes('leche') || lowerIngredient.includes('milk')) return '🥛';
  if (lowerIngredient.includes('queso') || lowerIngredient.includes('cheese')) return '🧀';
  if (lowerIngredient.includes('yogur') || lowerIngredient.includes('yogurt')) return '🥛';
  if (lowerIngredient.includes('mantequilla') || lowerIngredient.includes('butter')) return '🧈';
  if (lowerIngredient.includes('crema') || lowerIngredient.includes('cream')) return '🥛';
  
  // Vegetables
  if (lowerIngredient.includes('tomate') || lowerIngredient.includes('tomato') || lowerIngredient.includes('jitomate')) return '🍅';
  if (lowerIngredient.includes('cebolla') || lowerIngredient.includes('onion')) return '🧅';
  if (lowerIngredient.includes('ajo') || lowerIngredient.includes('garlic')) return '🧄';
  if (lowerIngredient.includes('zanahoria') || lowerIngredient.includes('carrot')) return '🥕';
  if (lowerIngredient.includes('brócoli') || lowerIngredient.includes('broccoli')) return '🥦';
  if (lowerIngredient.includes('lechuga') || lowerIngredient.includes('lettuce')) return '🥬';
  if (lowerIngredient.includes('espinaca') || lowerIngredient.includes('spinach')) return '🥬';
  if (lowerIngredient.includes('pepino') || lowerIngredient.includes('cucumber')) return '🥒';
  if (lowerIngredient.includes('pimiento') || lowerIngredient.includes('pepper') || lowerIngredient.includes('chile')) return '🌶️';
  if (lowerIngredient.includes('papa') || lowerIngredient.includes('potato') || lowerIngredient.includes('patata')) return '🥔';
  if (lowerIngredient.includes('maíz') || lowerIngredient.includes('corn') || lowerIngredient.includes('elote')) return '🌽';
  if (lowerIngredient.includes('champiñón') || lowerIngredient.includes('mushroom') || lowerIngredient.includes('hongo')) return '🍄';
  if (lowerIngredient.includes('aguacate') || lowerIngredient.includes('avocado')) return '🥑';
  if (lowerIngredient.includes('berenjena') || lowerIngredient.includes('eggplant')) return '🍆';
  if (lowerIngredient.includes('calabaza') || lowerIngredient.includes('squash') || lowerIngredient.includes('zucchini') || lowerIngredient.includes('calabacín')) return '🥒';
  
  // Fruits
  if (lowerIngredient.includes('manzana') || lowerIngredient.includes('apple')) return '🍎';
  if (lowerIngredient.includes('plátano') || lowerIngredient.includes('banana')) return '🍌';
  if (lowerIngredient.includes('naranja') || lowerIngredient.includes('orange')) return '🍊';
  if (lowerIngredient.includes('limón') || lowerIngredient.includes('lemon') || lowerIngredient.includes('lima') || lowerIngredient.includes('lime')) return '🍋';
  if (lowerIngredient.includes('fresa') || lowerIngredient.includes('strawberry')) return '🍓';
  if (lowerIngredient.includes('uva') || lowerIngredient.includes('grape')) return '🍇';
  if (lowerIngredient.includes('sandía') || lowerIngredient.includes('watermelon')) return '🍉';
  if (lowerIngredient.includes('piña') || lowerIngredient.includes('pineapple')) return '🍍';
  if (lowerIngredient.includes('mango')) return '🥭';
  if (lowerIngredient.includes('durazno') || lowerIngredient.includes('peach')) return '🍑';
  if (lowerIngredient.includes('pera') || lowerIngredient.includes('pear')) return '🍐';
  if (lowerIngredient.includes('cereza') || lowerIngredient.includes('cherry')) return '🍒';
  if (lowerIngredient.includes('coco') || lowerIngredient.includes('coconut')) return '🥥';
  if (lowerIngredient.includes('kiwi')) return '🥝';
  
  // Grains & Bread
  if (lowerIngredient.includes('arroz') || lowerIngredient.includes('rice')) return '🍚';
  if (lowerIngredient.includes('pan') || lowerIngredient.includes('bread')) return '🍞';
  if (lowerIngredient.includes('pasta') || lowerIngredient.includes('espagueti') || lowerIngredient.includes('spaghetti')) return '🍝';
  if (lowerIngredient.includes('tortilla')) return '🫓';
  if (lowerIngredient.includes('avena') || lowerIngredient.includes('oat')) return '🌾';
  if (lowerIngredient.includes('cereal')) return '🥣';
  if (lowerIngredient.includes('harina') || lowerIngredient.includes('flour')) return '🌾';
  
  // Legumes
  if (lowerIngredient.includes('frijol') || lowerIngredient.includes('bean')) return '🫘';
  if (lowerIngredient.includes('lenteja') || lowerIngredient.includes('lentil')) return '🫘';
  if (lowerIngredient.includes('garbanzo') || lowerIngredient.includes('chickpea')) return '🫘';
  
  // Condiments & Oils
  if (lowerIngredient.includes('aceite') || lowerIngredient.includes('oil')) return '🫒';
  if (lowerIngredient.includes('sal') || lowerIngredient.includes('salt')) return '🧂';
  if (lowerIngredient.includes('miel') || lowerIngredient.includes('honey')) return '🍯';
  if (lowerIngredient.includes('azúcar') || lowerIngredient.includes('sugar')) return '🍬';
  if (lowerIngredient.includes('salsa') || lowerIngredient.includes('sauce')) return '🥫';
  if (lowerIngredient.includes('vinagre') || lowerIngredient.includes('vinegar')) return '🍶';
  if (lowerIngredient.includes('mostaza') || lowerIngredient.includes('mustard')) return '🟡';
  if (lowerIngredient.includes('mayonesa') || lowerIngredient.includes('mayo')) return '🥄';
  
  // Nuts & Seeds
  if (lowerIngredient.includes('nuez') || lowerIngredient.includes('nut') || lowerIngredient.includes('almendra') || lowerIngredient.includes('almond')) return '🥜';
  if (lowerIngredient.includes('cacahuate') || lowerIngredient.includes('peanut')) return '🥜';
  
  // Drinks
  if (lowerIngredient.includes('café') || lowerIngredient.includes('coffee')) return '☕';
  if (lowerIngredient.includes('té') || lowerIngredient.includes('tea')) return '🍵';
  if (lowerIngredient.includes('jugo') || lowerIngredient.includes('juice')) return '🧃';
  if (lowerIngredient.includes('agua') || lowerIngredient.includes('water')) return '💧';
  if (lowerIngredient.includes('vino') || lowerIngredient.includes('wine')) return '🍷';
  
  // Herbs & Spices
  if (lowerIngredient.includes('cilantro') || lowerIngredient.includes('perejil') || lowerIngredient.includes('parsley') || lowerIngredient.includes('albahaca') || lowerIngredient.includes('basil')) return '🌿';
  if (lowerIngredient.includes('canela') || lowerIngredient.includes('cinnamon')) return '🟤';
  if (lowerIngredient.includes('pimienta') || lowerIngredient.includes('pepper')) return '🌶️';
  
  // Default
  return '🛒';
};

export function ShoppingItem({ ingredient, isPurchased, onToggle }: ShoppingItemProps) {
  const emoji = getIngredientEmoji(ingredient);

  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-2 md:px-3 rounded-md transition-colors min-w-0",
      isPurchased ? "bg-muted/50" : "hover:bg-accent/30 active:bg-accent/50"
    )}>
      <Checkbox
        id={`item-${ingredient}`}
        checked={isPurchased}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <span className="text-base shrink-0">{emoji}</span>
      <label 
        htmlFor={`item-${ingredient}`}
        className={cn(
          "text-xs md:text-sm cursor-pointer flex-1 min-w-0 break-words",
          isPurchased && "line-through text-muted-foreground"
        )}
      >
        {ingredient}
      </label>
    </div>
  );
}