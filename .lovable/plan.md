
# Plan: Corrección Completa para Aprobación en App Store

## Resumen de Problemas a Solucionar

| Guideline | Problema | Solución |
|-----------|----------|----------|
| 3.1.2 | EULA/Terms desactualizados (4 días, Stripe, MXN) | Actualizar Terms.tsx con info correcta |
| 2.1 | Texto placeholder/incompleto | Corregir términos y traduciones |
| 3.1.1 | Códigos promocionales para desbloquear contenido | **Eliminar paso 3 del onboarding (código influencer)** |
| 2.1 | App no carga en iPad post-onboarding | Agregar fallbacks de navegación |

---

## 1. Eliminar Paso del Código de Influencer (Guideline 3.1.1)

**Archivo: `src/pages/PreOnboarding.tsx`**

### Cambios:
1. Reducir `TOTAL_STEPS` de 30 a 29
2. Eliminar el caso `case 3` completo (código de influencer)
3. Re-numerar todos los pasos subsiguientes (-1)
4. Eliminar variables `influencerCode`, `showInfluencerInput`
5. Eliminar función `handleInfluencerCodeSubmit`
6. Actualizar `getMascotMessage()` para quitar mensaje del paso 3
7. Actualizar `canProceed()` ajustando los números de paso

### Lógica de re-numeración:
- Paso 2 (celebration) -> Navega directamente a paso 3 (goal selection)
- El antiguo paso 4 (goal) se convierte en paso 3
- Todos los demás pasos se recorren -1

---

## 2. Actualizar Términos y Condiciones (Guideline 3.1.2 & 2.1)

**Archivo: `src/pages/Terms.tsx`**

### Sección 5.2 - Período de Prueba (líneas 66-68 ES, 237-239 EN):

**ANTES:**
```
"Los nuevos usuarios reciben un período de prueba de 4 días. Al finalizar el período de prueba, se le pedirá que seleccione un plan de pago..."
```

**DESPUÉS:**
```
"Los nuevos usuarios pueden acceder a un período de prueba gratuito de 3 días al iniciar una suscripción. La prueba requiere proporcionar un método de pago válido a través de Apple. Si no se cancela al menos 24 horas antes del final del período de prueba, la suscripción se activará automáticamente con el cargo correspondiente."
```

### Sección 5.3 - Facturación (líneas 71-77 ES, 243-248 EN):

**ANTES:**
```
- "Los pagos se procesan de forma segura a través de Stripe"
- "Los precios están en pesos mexicanos (MXN)"
- "No se proporcionan reembolsos por períodos parciales"
```

**DESPUÉS:**
```
- "Los pagos se procesan de forma segura a través de Apple In-App Purchase"
- "Las suscripciones se renuevan automáticamente cada mes"
- "Los precios están en dólares estadounidenses (USD)"
- "Puede cancelar su suscripción en cualquier momento desde Configuración > Apple ID > Suscripciones en su dispositivo iOS"
- "Para solicitudes de reembolso, contacte directamente a Apple a través de reportaproblem.apple.com"
```

---

## 3. Corregir Compatibilidad iPad - Post-Onboarding (Guideline 2.1)

### A. Agregar Fallback en CommitmentScreen

**Archivo: `src/components/onboarding/CommitmentScreen.tsx`**

Agregar un `useEffect` que garantice la navegación incluso si algo falla:

```typescript
// Agregar después de línea 166 (cleanup useEffect)
useEffect(() => {
  if (isCompleted) {
    // Fallback: forzar navegación después de 5 segundos
    const fallbackTimeout = setTimeout(() => {
      console.warn('[CommitmentScreen] Fallback navigation triggered');
      navigate('/trial-roulette', { replace: true });
    }, 5000);
    return () => clearTimeout(fallbackTimeout);
  }
}, [isCompleted, navigate]);
```

### B. Agregar Botón de Continuar Manual en FreeTrialRoulette

**Archivo: `src/components/trial/FreeTrialRoulette.tsx`**

Agregar un botón que aparece después de ganar como fallback si la navegación automática falla:

```typescript
// Después del resultado del segundo giro exitoso (línea 256)
{showResult && result?.includes('3') && (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2 }}
    onClick={() => navigate('/trial-won', { replace: true })}
    className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg"
  >
    {language === 'es' ? 'Continuar' : 'Continue'}
  </motion.button>
)}
```

### C. Reducir partículas en iPad

**Archivo: `src/components/trial/FreeTrialRoulette.tsx`**

```typescript
// Línea 143 - reducir partículas para tablets
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const particleCount = isMobile ? 20 : 10;

// Usar particleCount en el map
{[...Array(particleCount)].map((_, i) => (
```

### D. Mejorar layout para tablets

Cambiar `min-h-[100dvh]` por una solución más robusta:

```typescript
// En FreeTrialRoulette, TrialWonCelebration, TrialTrustScreen, TrialActivation
className="min-h-screen min-h-[100dvh] ..."
```

---

## 4. Actualizar Enlaces de Terms/Privacy

**Archivos: `src/components/IAPPaywall.tsx`, `src/components/trial/TrialActivation.tsx`**

Los enlaces actuales usan `<a href="/terms">` que puede no funcionar en apps nativas.

**Solución:** Usar navegación de React Router:

```typescript
import { Link } from 'react-router-dom';

// Cambiar de:
<a href="/terms" className="hover:underline">

// A:
<Link to="/terms" className="hover:underline">
```

---

## Archivos a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `src/pages/PreOnboarding.tsx` | Eliminar paso 3 (código influencer) | CRÍTICA |
| `src/pages/Terms.tsx` | Actualizar trial 4→3 días, Stripe→Apple IAP, MXN→USD | CRÍTICA |
| `src/components/onboarding/CommitmentScreen.tsx` | Agregar fallback timeout 5s | ALTA |
| `src/components/trial/FreeTrialRoulette.tsx` | Botón continuar + reducir partículas iPad | ALTA |
| `src/components/IAPPaywall.tsx` | Cambiar `<a>` por `<Link>` | MEDIA |
| `src/components/trial/TrialActivation.tsx` | Cambiar `<a>` por `<Link>` | MEDIA |

---

## Orden de Implementación

1. **PreOnboarding.tsx** - Eliminar código de influencer (requiere re-numeración cuidadosa)
2. **Terms.tsx** - Actualizar información de pagos y trial
3. **CommitmentScreen.tsx** - Agregar fallback de navegación
4. **FreeTrialRoulette.tsx** - Botón continuar + optimizaciones iPad
5. **IAPPaywall.tsx & TrialActivation.tsx** - Corregir enlaces

---

## Notas Técnicas

### Re-numeración de pasos en PreOnboarding:
- Los pasos después del 2 se recorren -1
- El paso 3 actual (influencer) se elimina
- El paso 4 (goal) se convierte en 3
- Y así sucesivamente hasta el paso 30→29

### Imports a agregar:
- `Link` de `react-router-dom` en IAPPaywall y TrialActivation

### Variables a eliminar de PreOnboarding:
- `influencerCode` (línea 53)
- `showInfluencerInput` (línea 54)
- Función `handleInfluencerCodeSubmit` (líneas 298-307)
- Caso completo `case 3` (líneas 483-551)
- Mensaje de mascota para paso 3 (línea 341)

---

## Resultado Esperado

Después de estos cambios:
1. No hay códigos promocionales que desbloqueen contenido (Guideline 3.1.1 resuelto)
2. Los términos reflejan correctamente el trial de 3 días con Apple IAP (Guideline 3.1.2 resuelto)
3. El flujo de onboarding tiene fallbacks para iPad (Guideline 2.1 resuelto)
4. Los enlaces a Terms/Privacy funcionan correctamente en la app nativa
5. El onboarding tiene 29 pasos en lugar de 30
