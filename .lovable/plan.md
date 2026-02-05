

# Plan: Correcciones para Apple App Store (Sin Trial)

## Resumen de Cambios

Este plan corrige todos los problemas reportados por Apple y **elimina completamente el flujo de trial gratuito** (se agregará en el futuro).

---

## Cambios a Realizar

### 1. Eliminar Flujo de Ruleta y Trial (Guideline 3.1.1)

**Archivos a modificar:**

| Archivo | Acción |
|---------|--------|
| `src/components/onboarding/CommitmentScreen.tsx` | Cambiar navegación de `/trial-roulette` a `/dashboard` |
| `src/components/AnimatedRoutes.tsx` | Eliminar rutas: `/trial-roulette`, `/trial-won`, `/trial-trust`, `/trial-activate` |
| `src/components/trial/index.ts` | Limpiar exports |

**Archivos a eliminar:**
- `src/components/trial/FreeTrialRoulette.tsx`
- `src/components/trial/TrialWonCelebration.tsx`
- `src/components/trial/TrialTrustScreen.tsx`
- `src/components/trial/TrialActivation.tsx`

**Nuevo flujo post-onboarding:**
```
Onboarding (29 pasos) → Auth → CommitmentScreen → Dashboard
```

---

### 2. Agregar Links Legales Faltantes (Guideline 3.1.2)

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/components/onboarding/OnboardingAuthStep.tsx` | Cambiar `<a href="/terms">` a `<Link to="/terms">` |
| `src/components/ContextualPaywall.tsx` | Agregar links a Terms y Privacy |
| `src/pages/PostRegisterPaywall.tsx` | Agregar links a Terms y Privacy |
| `src/pages/PremiumPaywall.tsx` | Agregar links a Terms y Privacy |

**Formato de links a agregar:**
```tsx
<div className="text-center text-xs text-muted-foreground">
  <Link to="/terms" className="underline">Términos de Uso</Link>
  {" · "}
  <Link to="/privacy" className="underline">Política de Privacidad</Link>
</div>
```

---

### 3. Simplificación del Flujo (Guideline 2.1 - Bug iPad)

Al eliminar las 4 pantallas del trial, el flujo se reduce significativamente:

**Antes (problemático):**
```
Auth → Commitment → Roulette → Won → Trust → Activate → Dashboard
       (6 pantallas adicionales con animaciones pesadas)
```

**Después (simplificado):**
```
Auth → Commitment → Dashboard
       (1 pantalla adicional, navegación directa)
```

Esto minimiza la probabilidad de bugs en iPad Air M3.

---

## Archivos Finales

### Modificar:
1. `src/components/onboarding/CommitmentScreen.tsx`
2. `src/components/onboarding/OnboardingAuthStep.tsx`
3. `src/components/ContextualPaywall.tsx`
4. `src/pages/PostRegisterPaywall.tsx`
5. `src/pages/PremiumPaywall.tsx`
6. `src/components/AnimatedRoutes.tsx`
7. `src/components/trial/index.ts`

### Eliminar:
1. `src/components/trial/FreeTrialRoulette.tsx`
2. `src/components/trial/TrialWonCelebration.tsx`
3. `src/components/trial/TrialTrustScreen.tsx`
4. `src/components/trial/TrialActivation.tsx`

---

## Resultado Esperado

| Guideline | Problema | Solución |
|-----------|----------|----------|
| 3.1.2 | Links legales faltantes | ✅ Agregados en todos los paywalls |
| 3.1.1 | Promo codes (ruleta) | ✅ Eliminado completamente |
| 2.1 | Bug iPad post-onboarding | ✅ Flujo simplificado (menos pantallas) |
| 2.1 | Placeholder text | ✅ Ya estaba resuelto |

