
# Plan: Modo Bienestar Mental + Escáner Corporal IA

## Resumen Ejecutivo
Agregar dos nuevas funcionalidades premium que complementan el tracking nutricional: un sistema integral de bienestar mental conectado con la alimentación, y un escáner corporal con IA que estima composición corporal a partir de fotos.

---

## Parte 1: Modo Bienestar Completo

### 1.1 Check-In de Ánimo Diario

Un widget rápido en el Dashboard que permite registrar cómo te sientes en 3 segundos.

**Componente:** `src/components/wellness/MoodCheckInWidget.tsx`

| Elemento | Descripción |
|----------|-------------|
| Emojis interactivos | 😊 Excelente, 🙂 Bien, 😐 Normal, 😔 Bajo, 😫 Muy bajo |
| Factores opcionales | Estrés, Sueño, Energía, Ansiedad (selección rápida) |
| Nota rápida | Campo opcional de texto corto |

### 1.2 Correlación Comida-Ánimo

Insights de IA que relacionan patrones alimenticios con estados de ánimo.

**Edge Function:** `supabase/functions/analyze-mood-patterns/index.ts`

Analiza:
- Qué comiste los días que te sentiste mejor
- Patrones de macros relacionados con energía
- Horarios de comida vs estado de ánimo
- Déficit calórico vs estado emocional

### 1.3 Nueva Página de Bienestar

**Página:** `src/pages/Wellness.tsx`

**Tabs dentro:**
| Tab | Contenido |
|-----|-----------|
| Check-In | Registro del día actual con historial reciente |
| Tendencias | Gráficas de ánimo semanal/mensual |
| Insights | Análisis IA de correlación comida-ánimo |
| Tips | Consejos personalizados basados en patrones |

### 1.4 Base de Datos

```sql
-- Tabla para registros de ánimo
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  factors TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para insights generados
CREATE TABLE wellness_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  related_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Parte 2: Escáner Corporal IA

### 2.1 Componente de Captura

**Componente:** `src/components/body-scan/BodyScanCamera.tsx`

Guía visual para tomar fotos correctas:
- Indicador de postura correcta (silueta guía)
- Instrucciones de iluminación
- Opción frontal y lateral

### 2.2 Análisis con IA

**Edge Function:** `supabase/functions/analyze-body-composition/index.ts`

Usando Gemini Vision para estimar:
- % grasa corporal aproximado (rango)
- Tipo de cuerpo (ectomorfo, mesomorfo, endomorfo)
- Distribución de grasa (central, periférica)
- Notas sobre postura general

**Prompt del sistema:**
```
Analiza esta foto de cuerpo completo y estima:
1. Porcentaje de grasa corporal aproximado (dar rango, ej: 18-22%)
2. Tipo de cuerpo predominante
3. Distribución visual de composición
4. Observaciones generales

IMPORTANTE: Esto es una estimación visual educativa, 
no un diagnóstico médico.
```

### 2.3 Resultados y Seguimiento

**Componente:** `src/components/body-scan/BodyScanResultCard.tsx`

| Elemento | Descripción |
|----------|-------------|
| Estimación de % grasa | Rango visual con indicador de zona saludable |
| Tipo de cuerpo | Icono + descripción |
| Recomendaciones | Tips personalizados según composición |
| Historial | Comparación con scans anteriores |

### 2.4 Galería de Transformación

**Componente:** `src/components/body-scan/TransformationGallery.tsx`

- Comparación side-by-side de fotos anteriores
- Timeline visual de progreso
- Diferencia de estimaciones entre fechas

### 2.5 Base de Datos

```sql
-- Tabla para escaneos corporales
CREATE TABLE body_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT NOT NULL,
  scan_type TEXT CHECK (scan_type IN ('front', 'side')) DEFAULT 'front',
  estimated_body_fat_min DECIMAL,
  estimated_body_fat_max DECIMAL,
  body_type TEXT,
  fat_distribution TEXT,
  ai_notes TEXT,
  raw_analysis JSONB,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Parte 3: Integración en la App

### 3.1 Navegación

Agregar nueva entrada en `MobileBottomNav`:
- Reemplazar o agregar tab "Más" → incluir acceso a Bienestar
- O agregar icono de corazón/brain en la navegación

**Ruta:** `/dashboard/wellness`

### 3.2 Dashboard Widgets

Agregar en el Dashboard principal:
- Mini widget de Mood si no has hecho check-in hoy
- Prompt para primer body scan

### 3.3 Progress Page

Agregar nuevo tab "Bienestar" en Progress:
- Gráfica de ánimo junto a peso/nutrición
- Correlación visual

---

## Parte 4: Flujo de Usuario

### Mood Check-In (Bienestar Mental)

```text
┌─────────────────────────────────────────┐
│           Dashboard                      │
│  ┌─────────────────────────────────┐    │
│  │ 😊 ¿Cómo te sientes hoy?         │    │
│  │ [Excelente] [Bien] [Normal]...  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
                    ▼ (selecciona emoji)
┌─────────────────────────────────────────┐
│     Factores (opcional)                  │
│  [😴 Dormí mal] [💼 Estrés] [⚡ Energía] │
│  [Agregar nota...]                       │
│                     [Guardar ✓]          │
└─────────────────────────────────────────┘
                    │
                    ▼ (cada 7 días)
┌─────────────────────────────────────────┐
│       Insight de IA                      │
│  "Los días que comiste más proteína,     │
│   tu ánimo promedio fue 20% mejor 📈"   │
└─────────────────────────────────────────┘
```

### Body Scan (Escáner Corporal)

```text
┌─────────────────────────────────────────┐
│        Página de Bienestar               │
│   [Ánimo] [Cuerpo] [Insights]           │
└─────────────────────────────────────────┘
                    │
                    ▼ (tab Cuerpo)
┌─────────────────────────────────────────┐
│     📸 Escanea tu Cuerpo                 │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │     👤 (silueta guía)           │    │
│  │                                  │    │
│  │   Colócate de frente             │    │
│  │   Buena iluminación              │    │
│  │   Ropa ajustada                  │    │
│  └─────────────────────────────────┘    │
│                                          │
│        [📷 Tomar Foto]                   │
└─────────────────────────────────────────┘
                    │
                    ▼ (análisis IA ~5 seg)
┌─────────────────────────────────────────┐
│        Resultados                        │
│  ┌─────────────────────────────────┐    │
│  │ % Grasa Estimado: 18-22%        │    │
│  │ ■■■■■■■□□□ Rango Saludable      │    │
│  │                                  │    │
│  │ Tipo de Cuerpo: Mesomorfo       │    │
│  │ Distribución: Central           │    │
│  └─────────────────────────────────┘    │
│                                          │
│  💡 Recomendación:                       │
│  "Tu composición sugiere enfocarte      │
│   en mantener proteína alta..."         │
│                                          │
│  [Ver Historial] [Nuevo Scan]           │
└─────────────────────────────────────────┘
```

---

## Archivos a Crear

### Componentes Nuevos (10)
| Archivo | Propósito |
|---------|-----------|
| `src/pages/Wellness.tsx` | Página principal de bienestar |
| `src/components/wellness/MoodCheckInWidget.tsx` | Widget de check-in de ánimo |
| `src/components/wellness/MoodHistoryChart.tsx` | Gráfica de tendencias de ánimo |
| `src/components/wellness/MoodInsightsCard.tsx` | Tarjeta de insights IA |
| `src/components/wellness/WellnessTips.tsx` | Tips personalizados |
| `src/components/body-scan/BodyScanCamera.tsx` | Interfaz de captura corporal |
| `src/components/body-scan/BodyScanResultCard.tsx` | Resultados del análisis |
| `src/components/body-scan/TransformationGallery.tsx` | Galería de progreso |
| `src/components/body-scan/BodyTypeIndicator.tsx` | Indicador visual de tipo de cuerpo |
| `src/hooks/useWellness.ts` | Hook para datos de bienestar |

### Edge Functions (2)
| Archivo | Propósito |
|---------|-----------|
| `supabase/functions/analyze-mood-patterns/index.ts` | Análisis de correlación comida-ánimo |
| `supabase/functions/analyze-body-composition/index.ts` | Análisis de composición corporal |

### Archivos a Editar (4)
| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Agregar rutas de wellness |
| `src/pages/MorePage.tsx` | Agregar acceso a Bienestar |
| `src/pages/Dashboard.tsx` | Widget de mood check-in |
| `src/pages/Progress.tsx` | Tab de bienestar opcional |

---

## Sección Técnica

### Modelo de Análisis de Composición Corporal

```typescript
// supabase/functions/analyze-body-composition/index.ts

const systemPrompt = `Eres un experto en fitness y composición corporal. 
Analiza esta foto de cuerpo completo y proporciona una estimación visual.

IMPORTANTE:
- Esto es SOLO una estimación educativa visual
- NO es un diagnóstico médico
- Usa rangos amplios para el % de grasa corporal
- Sé respetuoso y constructivo en las observaciones

Responde en JSON:
{
  "success": true,
  "estimated_body_fat": {
    "min": número,
    "max": número,
    "category": "bajo" | "saludable" | "moderado" | "alto"
  },
  "body_type": "ectomorfo" | "mesomorfo" | "endomorfo" | "combinado",
  "fat_distribution": "central" | "periférica" | "uniforme",
  "observations": "observaciones constructivas",
  "recommendations": ["tip1", "tip2"],
  "confidence": "high" | "medium" | "low"
}`;
```

### Hook de Bienestar

```typescript
// src/hooks/useWellness.ts

interface MoodLog {
  id: string;
  mood_score: number; // 1-5
  factors: string[];
  note?: string;
  logged_at: string;
}

interface WellnessState {
  todaysMood: MoodLog | null;
  weeklyMoods: MoodLog[];
  insights: WellnessInsight[];
  averageMood: number;
  isLoading: boolean;
}

export const useWellness = (userId: string | undefined) => {
  // Fetch mood logs
  // Calculate trends
  // Get AI insights
  
  const logMood = async (score: number, factors: string[], note?: string) => {
    // Insert into mood_logs
  };
  
  const hasTodaysMood = () => todaysMood !== null;
  
  return { ...state, logMood, hasTodaysMood };
};
```

### Diseño del Widget de Mood

```typescript
// MoodCheckInWidget.tsx - Estructura

const moodOptions = [
  { score: 5, emoji: '😊', label: 'Excelente', color: 'bg-green-500' },
  { score: 4, emoji: '🙂', label: 'Bien', color: 'bg-lime-500' },
  { score: 3, emoji: '😐', label: 'Normal', color: 'bg-yellow-500' },
  { score: 2, emoji: '😔', label: 'Bajo', color: 'bg-orange-500' },
  { score: 1, emoji: '😫', label: 'Muy bajo', color: 'bg-red-500' },
];

const factorOptions = [
  { id: 'sleep', emoji: '😴', label: 'Dormí mal' },
  { id: 'stress', emoji: '💼', label: 'Estrés' },
  { id: 'energy', emoji: '⚡', label: 'Baja energía' },
  { id: 'anxiety', emoji: '😰', label: 'Ansiedad' },
  { id: 'exercise', emoji: '🏃', label: 'Hice ejercicio' },
  { id: 'social', emoji: '👥', label: 'Vida social' },
];
```

---

## Consideraciones de Premium

| Funcionalidad | Free | Chefly Plus |
|---------------|------|-------------|
| Check-in de ánimo | ✅ Ilimitado | ✅ Ilimitado |
| Ver gráficas de 7 días | ✅ | ✅ |
| Gráficas históricas completas | ❌ | ✅ |
| Insights de IA comida-ánimo | ❌ | ✅ |
| Body Scan | ❌ | ✅ (3/mes) |
| Galería de transformación | ❌ | ✅ |

---

## Resultado Esperado

### Experiencia de Bienestar Mental
- Check-in de ánimo en 3 segundos desde el Dashboard
- Visualización de tendencias emocionales
- Insights de IA que conectan alimentación con estado de ánimo
- Tips personalizados basados en patrones

### Experiencia de Body Scan
- Captura guiada con silueta de referencia
- Análisis de composición en ~5 segundos
- Estimación de % grasa corporal con rangos
- Seguimiento visual de transformación
- Recomendaciones personalizadas

### Valor Agregado
- Diferenciación única vs competencia (ninguna app de nutrición tiene esto integrado)
- Mayor engagement diario (check-in de ánimo)
- Conversión a premium (body scan es premium)
- Datos valiosos para personalización de planes
