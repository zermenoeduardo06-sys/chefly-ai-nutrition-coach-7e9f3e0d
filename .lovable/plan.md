
# Plan: Corregir Error de Hooks en Chef IA

## Diagnóstico

### Problema Identificado
El componente `ChefIA.tsx` tiene un **hook declarado después de returns condicionales**, lo cual viola las reglas de React Hooks y causa que la aplicación falle con el error "Algo salió mal".

### Ubicación del Error
```typescript
// Línea 651-680: Returns condicionales
if (initialLoading || trialLoading || subscription?.isLoading) {
  return <LoadingScreen />;
}
if (isBlocked) {
  return null;
}
if (!subscription?.isCheflyPlus) {
  return <ChatPaywall />;
}

// Línea 682: ❌ HOOK DESPUÉS DE RETURNS
const inputRef = useRef<HTMLTextAreaElement>(null);  // ← ESTO CAUSA EL ERROR
```

### Regla Violada
> "Los hooks deben ser llamados siempre en el mismo orden en cada renderizado. No pueden estar después de condiciones, loops o returns anticipados."

Cuando el componente renderiza y hace un return anticipado (ej: mostrar loading o paywall), el hook `inputRef` nunca se ejecuta. Cuando luego renderiza normalmente, React detecta que la cantidad de hooks cambió y lanza un error.

---

## Solución

### Mover el Hook al Inicio del Componente

Mover `const inputRef = useRef<HTMLTextAreaElement>(null);` al bloque donde están los demás hooks (junto a `scrollRef` en la línea 453).

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ChefIA.tsx` | Mover `inputRef` al inicio, junto con los otros hooks |

---

## Cambio Específico

### Antes (línea 682 - después de returns)
```typescript
// ... returns condicionales arriba ...

const inputRef = useRef<HTMLTextAreaElement>(null);  // ❌ MAL

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  // ...
```

### Después (mover a línea ~453)
```typescript
// Junto a scrollRef y otros hooks al inicio del componente
const scrollRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLTextAreaElement>(null);  // ✅ BIEN
const { limits, refreshLimits } = useSubscriptionLimits(userId);
```

---

## Impacto

| Antes | Después |
|-------|---------|
| Error "Algo salió mal" al entrar a Chef IA | Página carga correctamente |
| Hook violando reglas de React | Hooks en orden correcto |

---

## Archivos a Modificar

1. **`src/pages/ChefIA.tsx`**
   - Eliminar la línea 682 donde está `const inputRef = useRef<HTMLTextAreaElement>(null);`
   - Agregar esa misma línea después de `const scrollRef = useRef<HTMLDivElement>(null);` (línea 453)

Este es un cambio mínimo de 2 líneas que corrige completamente el error.
