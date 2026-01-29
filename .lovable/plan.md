
# Plan: Actualizar Tutorial de Bienvenida para Nuevos Usuarios

## Diagnóstico

### Estado Actual

El tutorial de bienvenida tiene 3 versiones:
| Componente | Uso | Estado |
|------------|-----|--------|
| `MobileWelcomeTutorial.tsx` | Móvil/Nativo | **Desactualizado** - rutas y pasos incorrectos |
| `DashboardTutorial.tsx` | Desktop (diálogo) | Traducciones obsoletas |
| `InAppTour.tsx` | Desktop (spotlight) | Necesita actualizar targets |

### Problemas Identificados

1. **Mascota incorrecta**: Usa `mascot-lime.png` en lugar de `mascot-happy.png` (la mascota oficial Chefly)

2. **Navegación obsoleta**: Los pasos del tutorial hacen referencia a rutas que ya no existen:
   - `/dashboard/shopping` → ahora no existe (lista de compras movida)
   - `/dashboard/food-history` → obsoleto
   - `/dashboard/profile` → ahora el perfil está en el avatar del header

3. **Pestañas actuales no reflejadas**: La navegación actual es:
   - **Diario** (`/dashboard`) - Ver plan y registrar comidas
   - **Recetas** (`/recipes`) - Explorar recetas
   - **Progreso** (`/dashboard/progress`) - Estadísticas y body scan
   - **Chef IA** (`/chef-ia`) - Chat con el coach
   - **Bienestar** (`/dashboard/wellness`) - Mood y tips

4. **Contenido faltante**:
   - No menciona el escáner de alimentos (feature premium importante)
   - No menciona el seguimiento de bienestar
   - No explica cómo acceder al perfil (avatar en header)

---

## Solución

### Actualizar MobileWelcomeTutorial

Rediseñar los pasos del tour para reflejar la navegación actual:

```text
Paso 1: Bienvenida (pantalla central con mascota)
Paso 2: Diario - Tu centro de nutrición diario  
Paso 3: Recetas - Explora recetas personalizadas
Paso 4: Progreso - Estadísticas y body scan
Paso 5: Chef IA - Tu coach nutricional 24/7
Paso 6: Bienestar - Cuida tu mente y cuerpo
Paso 7: Tu Perfil - Accede desde tu avatar (¡NUEVO!)
```

### Nuevos Pasos del Tour

| Paso | Target | Icono | Título ES | Título EN | Descripción ES | Descripción EN |
|------|--------|-------|-----------|-----------|----------------|----------------|
| 1 | welcome | Mascota | ¡Bienvenido a Chefly! | Welcome to Chefly! | Soy tu coach de nutrición con IA. Te guiaré por la app para que saques el máximo provecho. | I'm your AI nutrition coach. I'll guide you through the app. |
| 2 | nav-diary | BookOpen | Tu Diario | Your Diary | Aquí verás tu resumen del día: calorías, macros y comidas. Registra lo que comes y completa tu plan. | Here you'll see your daily summary: calories, macros and meals. Log what you eat and complete your plan. |
| 3 | nav-recipes | ChefHat | Recetas | Recipes | Explora recetas personalizadas según tus preferencias. Cada una incluye ingredientes, pasos y valores nutricionales. | Explore personalized recipes based on your preferences. Each includes ingredients, steps and nutritional values. |
| 4 | nav-progress | TrendingUp | Tu Progreso | Your Progress | Visualiza gráficas de tu evolución nutricional y medidas corporales. ¡También puedes hacer un body scan con IA! | Visualize charts of your nutritional evolution and body measurements. You can also do an AI body scan! |
| 5 | nav-chef | Sparkles | Chef IA | Chef AI | ¿Dudas sobre nutrición? Pregúntame lo que quieras. Estoy aquí 24/7 para ayudarte con recetas, sustituciones y más. | Questions about nutrition? Ask me anything. I'm here 24/7 to help with recipes, substitutions and more. |
| 6 | nav-wellness | Heart | Bienestar | Wellness | Registra cómo te sientes cada día. Descubre patrones entre tu alimentación y tu estado de ánimo. | Track how you feel each day. Discover patterns between your nutrition and mood. |
| 7 | profile | User | Tu Perfil | Your Profile | Toca tu avatar en la esquina superior para acceder a tu perfil, ajustes y notificaciones. | Tap your avatar in the top corner to access your profile, settings and notifications. |

---

## Cambios por Archivo

### 1. `src/components/MobileWelcomeTutorial.tsx`

**Cambios:**
- Cambiar import de `mascot-lime.png` → `mascot-happy.png`
- Actualizar array `tourSteps` con los 7 nuevos pasos
- Actualizar `pathMap` con las rutas correctas:
  ```typescript
  const pathMap: Record<string, string> = {
    diary: "/dashboard",
    recipes: "/recipes", 
    progress: "/dashboard/progress",
    chef: "/chef-ia",
    wellness: "/dashboard/wellness",
    profile: "", // Avatar en header, no es nav item
  };
  ```
- Agregar iconos `BookOpen`, `Heart`, `User` de lucide-react
- Añadir lógica especial para el paso "profile" que no necesita highlight de nav

### 2. `src/components/DashboardTutorial.tsx`

**Cambios:**
- Actualizar los `steps` para reflejar las nuevas features
- Agregar paso de "Bienestar" 
- Agregar paso de "Escáner de Alimentos" (feature premium importante)
- Cambiar iconos para mayor consistencia con la navegación

### 3. `src/contexts/LanguageContext.tsx`

**Cambios:**
- Actualizar traducciones de `tutorial.*` para ambos idiomas
- Hacer los textos más cortos y orientados a la acción
- Añadir nuevas keys para bienestar y escáner

---

## Antes vs Después

### Pasos del Tour Móvil

| Antes | Después |
|-------|---------|
| 1. Bienvenida | 1. Bienvenida (con mascota oficial) |
| 2. Tu menú semanal (Home) | 2. Tu Diario (BookOpen icon) |
| 3. Lista de compras ❌ obsoleto | 3. Recetas (ChefHat icon) |
| 4. Escanea tu comida (Camera) | 4. Tu Progreso (TrendingUp) |
| 5. Tu progreso | 5. Chef IA (Sparkles) |
| 6. Chat con coach | 6. Bienestar (Heart) ✨ nuevo |
| 7. Tu perfil ❌ nav obsoleto | 7. Tu Perfil (acceso por avatar) |

---

## Detalles Técnicos

### Selector para Avatar/Perfil

Como el perfil ahora está en el header (no en la navegación inferior), necesitamos un selector especial:

```typescript
// Para el paso de "profile", buscar el avatar en el header
if (step.target === "profile") {
  element = document.querySelector('[data-tour="user-avatar"]');
}
```

Agregar `data-tour="user-avatar"` al componente del avatar en `DashboardHeader.tsx`.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/MobileWelcomeTutorial.tsx` | Actualizar pasos, rutas, iconos y mascota |
| `src/components/DashboardTutorial.tsx` | Actualizar pasos y descripciones |
| `src/contexts/LanguageContext.tsx` | Actualizar traducciones del tutorial |
| `src/components/DashboardHeader.tsx` | Agregar `data-tour="user-avatar"` al avatar |

---

## Resultado Final

Un tutorial de bienvenida que:

1. **Es visualmente consistente** - Usa la mascota oficial Chefly
2. **Refleja la UI actual** - Todas las pestañas y rutas correctas
3. **Destaca features clave** - Bienestar, Chef IA, Progreso con body scan
4. **Es más corto y accionable** - Textos concisos orientados al valor
5. **Funciona en móvil y desktop** - Responsive con ambos componentes actualizados
