
# Auditoría Completa iOS - App Store Review Guidelines

## Resumen Ejecutivo

He realizado una auditoría exhaustiva de la app y encontré **varios problemas críticos** que deben corregirse antes de re-enviar a Apple.

---

## 🔴 PROBLEMAS CRÍTICOS (Causan Rechazo)

### 1. Información Desactualizada en FAQ.tsx (Guideline 2.1)

**Archivo:** `src/pages/FAQ.tsx` (líneas 46-61)

**Problema detectado:**
- Menciona **"4 días de prueba gratis"** cuando ahora son **3 días**
- Dice **"sin necesidad de tarjeta de crédito"** cuando **SÍ se requiere** (Apple IAP)
- Menciona precios en **"$199 MXN/mes"** cuando ahora es **$7.99 USD**

**Texto actual (línea 48 ES):**
```
"Ofrecemos varios planes desde $199 MXN/mes. Todos los planes incluyen 4 días 
de prueba gratis sin necesidad de tarjeta de crédito."
```

**Texto actual (línea 60 ES):**
```
"Durante los 4 días de prueba gratis tendrás acceso completo... 
No necesitas ingresar datos de tarjeta para comenzar."
```

**Corrección necesaria:**
```
ES: "Ofrecemos Chefly Plus a $7.99 USD/mes. Los nuevos usuarios pueden 
acceder a un período de prueba de 3 días al iniciar la suscripción."

ES: "Durante los 3 días de prueba tendrás acceso completo a todas las 
funciones premium. Se requiere método de pago a través de Apple."
```

---

### 2. Información Desactualizada en LanguageContext.tsx (Guideline 2.1)

**Archivo:** `src/contexts/LanguageContext.tsx`

**Problemas detectados (líneas 153-157 ES, 1437-1441 EN):**

| Clave | Valor Actual | Valor Correcto |
|-------|--------------|----------------|
| `auth.trialInfo` | "Prueba gratis por 4 días sin tarjeta requerida" | "Prueba de 3 días con tarjeta" |
| `auth.freeTrial` | "Prueba gratuita de 4 días" | "Prueba de 3 días gratis" |
| `auth.noCreditCard` | "Sin tarjeta de crédito requerida" | **ELIMINAR o cambiar** |

**Corrección:**
```typescript
// Línea 153
"auth.trialInfo": "Prueba de 3 días gratis al suscribirte",
// Línea 156  
"auth.freeTrial": "3 días de prueba gratis",
// Línea 157
"auth.noCreditCard": "Prueba gratuita incluida",

// Líneas EN equivalentes (1437-1441)
"auth.trialInfo": "3-day free trial with subscription",
"auth.freeTrial": "3-day free trial",
"auth.noCreditCard": "Free trial included",
```

---

### 3. Enlaces en Subscription.tsx usan `<a href>` (Guideline 3.1.2)

**Archivo:** `src/pages/Subscription.tsx` (líneas 345-351)

**Problema:** Los enlaces a Terms y Privacy usan `<a href>` que puede no funcionar correctamente en la app nativa iOS.

**Código actual:**
```typescript
<a href="/terms" className="hover:underline">
<a href="/privacy" className="hover:underline">
```

**Corrección:** Usar `<Link to>` de React Router (ya importado):
```typescript
import { Link } from 'react-router-dom'; // Ya está en otros archivos

<Link to="/terms" className="hover:underline">
<Link to="/privacy" className="hover:underline">
```

---

### 4. Precio en MXN en Subscription.tsx (Guideline 2.1)

**Archivo:** `src/pages/Subscription.tsx` (línea 77)

**Problema:** Muestra precio en MXN además de USD, pero Apple solo acepta USD para IAP.

**Código actual:**
```typescript
price: "$150 MXN",
priceUsd: "$7.99",
```

**Corrección:** Solo mostrar USD:
```typescript
price: "$7.99",
priceUsd: "$7.99", // Mantener para compatibilidad
```

---

### 5. Referencias a Stripe en comentarios y hooks

**Archivos afectados:**
- `src/hooks/useSubscriptionLimits.ts` (líneas 36-45)
- `src/pages/Dashboard.tsx` (línea 302)
- `src/components/SubscriptionBanner.tsx` (líneas 27-28)

**Problema:** Aunque funcionalmente usan Apple IAP, los comentarios mencionan "Stripe" lo cual puede confundir y no afecta directamente la revisión, pero debería limpiarse.

**Ejemplo (Dashboard.tsx línea 302):**
```typescript
// Check subscription status on return from Stripe
```

**Corrección:** Actualizar comentarios a "Apple IAP" o simplemente "subscription".

---

## 🟠 PROBLEMAS IMPORTANTES (Pueden Causar Rechazo)

### 6. Falta Disclaimer de Salud Prominente

**Guideline 5.1.1 - Data Collection and Storage / Health & Fitness**

Aunque existe un disclaimer en Terms.tsx, Apple a veces rechaza apps de nutrición/fitness si no tienen un disclaimer visible durante el uso normal.

**Recomendación:** Agregar un pequeño texto en la pantalla de Dashboard o Settings:
```
"Esta app no proporciona asesoramiento médico. 
Consulta a un profesional antes de cambios en tu dieta."
```

---

### 7. Botón MoreHorizontal sin funcionalidad (Guideline 2.1)

**Archivo:** `src/pages/AddFood.tsx` (líneas 341-343)

**Problema:** Hay un botón con icono `MoreHorizontal` que no hace nada.

**Código actual:**
```typescript
<button className="p-2">
  <MoreHorizontal className="h-6 w-6" />
</button>
```

**Corrección:** Eliminar o agregar funcionalidad (menú contextual).

---

### 8. Safe Areas en Algunos Componentes

**Archivos a verificar:**
- `src/pages/PremiumPaywall.tsx` - ✅ Tiene safe-area-top
- `src/pages/ChefIA.tsx` - Revisar bottom safe area para el input
- `src/components/MobileBottomNav.tsx` - ✅ Correcto

**ChefIA.tsx (líneas 760-800):** El área de input debe considerar el safe-area-inset-bottom cuando NO hay bottom nav visible.

---

## 🟡 MEJORAS RECOMENDADAS (No causan rechazo pero mejoran UX)

### 9. Header Estable (DashboardHeader.tsx)

**Problema reportado:** Header cambia de tamaño inesperadamente.

**Corrección en `src/components/DashboardHeader.tsx`:**
```typescript
// Línea 44-45: Agregar altura mínima fija
<motion.div 
  initial={{ opacity: 0 }}  // Cambiar de y: -10 a solo opacity
  animate={{ opacity: 1 }}
  className="mb-6 min-h-[72px]"  // Agregar min-h
>
  // ... contenido ...
  <span className="text-primary max-w-[150px] truncate inline-block">
    {name}  // Truncar nombres largos
  </span>
```

---

### 10. Footer Estable (MobileBottomNav.tsx)

El footer ya tiene hardware acceleration, pero podría beneficiarse de ocultar cuando el teclado está abierto:

```typescript
// Agregar detección de teclado virtual
const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    const isKeyboard = window.visualViewport 
      ? window.visualViewport.height < window.innerHeight * 0.8
      : false;
    setIsKeyboardOpen(isKeyboard);
  };

  window.visualViewport?.addEventListener('resize', handleResize);
  return () => window.visualViewport?.removeEventListener('resize', handleResize);
}, []);

// En el return: if (isKeyboardOpen) return null;
```

---

## 📋 CHECKLIST FINAL - LISTO PARA ENVIAR

### Cumplimiento Apple (Crítico)
- [ ] FAQ.tsx actualizado con 3 días + requiere pago Apple
- [ ] LanguageContext.tsx actualizado (auth.trialInfo, auth.freeTrial, auth.noCreditCard)
- [ ] Subscription.tsx: enlaces `<a>` → `<Link>`
- [ ] Subscription.tsx: eliminar referencia a MXN
- [ ] Botón "Restore Purchases" visible y funcional ✅ (Ya existe)
- [ ] Delete Account funcional ✅ (Ya existe)
- [ ] Terms y Privacy accesibles ✅ (Ya corregidos)
- [ ] Legal text en paywalls ✅ (Ya existe)

### Funcionalidad
- [ ] iPad: Fallback timeout en CommitmentScreen ✅ (Ya agregado)
- [ ] iPad: Botón continuar en FreeTrialRoulette ✅ (Ya agregado)
- [ ] Código de influencer eliminado ✅ (Ya eliminado)
- [ ] Botón MoreHorizontal en AddFood.tsx: eliminar o implementar

### UX/UI
- [ ] Header con altura fija (min-h-[72px])
- [ ] Footer oculto cuando teclado visible
- [ ] Nombres truncados en header
- [ ] Animaciones solo opacity (sin y: -10)

---

## Archivos a Modificar (Orden de Prioridad)

| # | Archivo | Cambio | Prioridad |
|---|---------|--------|-----------|
| 1 | `src/pages/FAQ.tsx` | Actualizar trial 4→3, agregar requisito de pago | CRÍTICA |
| 2 | `src/contexts/LanguageContext.tsx` | Actualizar traducciones auth.* | CRÍTICA |
| 3 | `src/pages/Subscription.tsx` | `<a>` → `<Link>`, eliminar MXN | CRÍTICA |
| 4 | `src/pages/AddFood.tsx` | Eliminar o implementar botón MoreHorizontal | ALTA |
| 5 | `src/components/DashboardHeader.tsx` | Altura fija, truncate, solo opacity | MEDIA |
| 6 | `src/components/MobileBottomNav.tsx` | Detección de teclado virtual | MEDIA |
| 7 | Comentarios Stripe → IAP | Limpieza de código | BAJA |

---

## Validación Post-Cambios

1. **Probar en iPad Air 11"** (dispositivo de prueba de Apple)
2. **Verificar flujo completo:** Onboarding → Registro → Paywall → Compra → Dashboard
3. **Verificar enlaces** a Terms y Privacy desde todos los paywalls
4. **Probar Restore Purchases** funciona correctamente
5. **Verificar que no hay textos placeholder** o "Lorem ipsum"
6. **Revisar que todos los botones tienen funcionalidad**

---

## Notas para App Store Connect

Al re-enviar, incluir en las notas para el revisor:

```
Cambios realizados en respuesta al rechazo:

1. EULA/Terms actualizados con información correcta del trial de 3 días 
   y Apple In-App Purchase
2. Eliminado código promocional que podía confundirse con desbloqueo 
   de contenido
3. Corregida compatibilidad con iPad - agregados fallbacks de navegación
4. Actualizados todos los textos de trial y suscripción para reflejar 
   la configuración actual de Apple IAP
5. Verificados enlaces funcionales a Términos y Privacidad

Cuenta de prueba: [proporcionar si es necesario]
```
