

# Plan: Flujo de Trial Gratuito Gamificado (3 Días)

## Resumen Ejecutivo

Implementar un flujo de 4 pantallas fullscreen altamente gamificado que aparece despues de CommitmentScreen y antes del Dashboard. El flujo usa una ruleta "rigged" que simula suerte, celebracion emocional, confianza/claridad, y finalmente activacion del trial via Apple IAP con introductory offer.

## Flujo de Navegacion

```text
[CommitmentScreen]
       |
       v
[Pantalla 1: FreeTrialRoulette]  <-- Gira 2 veces, "gana" 3 dias
       |
       v
[Pantalla 2: TrialWonCelebration]  <-- Confetti + beneficios
       |
       v
[Pantalla 3: TrialTrustScreen]  <-- Garantias y claridad
       |
       v
[Pantalla 4: TrialActivation]  <-- Ingreso tarjeta via Apple IAP
       |
       v
[WelcomePlusScreen] o [Dashboard]
```

## Configuracion en App Store Connect

Antes de implementar el codigo, necesitas configurar en App Store Connect:

1. **Ir a Subscriptions > chefly_plus_monthly_**
2. **Agregar Introductory Offer:**
   - Type: Free Trial
   - Duration: 3 days
   - Eligibility: New subscribers only
3. **Guardar y enviar para revision**

RevenueCat detectara automaticamente la oferta introductoria y la aplicara cuando el usuario inicie la compra.

---

## Pantalla 1: FreeTrialRoulette

**Archivo:** `src/components/trial/FreeTrialRoulette.tsx`

**Elementos visuales:**

- Fondo premium con gradiente oscuro y particulas flotantes
- Ruleta circular con 8 segmentos: "1 dia", "Nada", "3 dias", "Nada", "2 dias", "Nada", "7 dias", "Nada"
- Boton "Girar ruleta" grande y brillante
- Mascota animada observando

**Logica de la ruleta:**

```text
Estado inicial: canSpin = true, spinsRemaining = 2

Primer giro:
- Animacion de 3-4 segundos con easing out
- Aterriza en "Nada" o "1 dia" (predeterminado)
- Haptic de decepcion (warning)
- Mensaje: "Casi... Tienes otro intento!"
- spinsRemaining = 1

Segundo giro:
- Animacion de 4-5 segundos mas dramatica
- Aterriza SIEMPRE en "3 dias" (angulo calculado)
- Haptic de celebracion
- Explosicion de confetti
- Delay 1s -> navegar a siguiente pantalla
```

**Animaciones:**

- Ruleta: `rotate` con CSS transform + easing cubic-bezier
- Indicador: triangulo pulsante arriba de la ruleta
- Boton: escala + glow mientras esta habilitado
- Resultado: texto animado con scale bounce

---

## Pantalla 2: TrialWonCelebration

**Archivo:** `src/components/trial/TrialWonCelebration.tsx`

**Elementos visuales:**

- Fondo con explosion de colores (radial gradient animado)
- Numero "3" gigante con efecto de brillo
- Texto "DIAS GRATIS" debajo
- Iconos de beneficios que aparecen secuencialmente:
  1. Planes ilimitados
  2. Escaneo IA
  3. Chef IA
  4. Sin cargos hoy
- Mascota celebrando
- Boton "Continuar" en la parte inferior

**Animaciones:**

- Numero "3" entra con scale spring desde 0
- Cada beneficio aparece con stagger de 200ms
- Confetti continuo por 3 segundos
- Haptic pattern: success + celebration
- Particulas/estrellas flotando

**Copy:**

```text
ES: "Ganaste 3 dias de prueba Chefly Plus!"
EN: "You won 3 days of Chefly Plus trial!"
```

---

## Pantalla 3: TrialTrustScreen

**Archivo:** `src/components/trial/TrialTrustScreen.tsx`

**Elementos visuales:**

- Fondo limpio y profesional
- 4 tarjetas de garantia con iconos:
  1. Shield: "Cancela cuando quieras"
  2. Bell: "Te avisamos 24h antes del cobro"
  3. DollarSign: "Sin cargos hoy - $0.00"
  4. Lock: "Pago 100% seguro con Apple"
- Mascota tranquila/confiable
- Boton CTA: "Activar mi prueba gratis"

**Animaciones:**

- Cada tarjeta entra con slide-in desde la derecha
- Stagger de 150ms entre tarjetas
- Iconos con pequeño bounce al aparecer
- Checkmarks verdes que aparecen despues de cada tarjeta

**Copy adicional:**

```text
ES: 
  subtitle: "Tu tranquilidad es nuestra prioridad"
  cta: "Activar mi prueba gratis"
  
EN:
  subtitle: "Your peace of mind is our priority"
  cta: "Activate my free trial"
```

---

## Pantalla 4: TrialActivation

**Archivo:** `src/components/trial/TrialActivation.tsx`

**Estructura:**

Esta pantalla usa el componente IAPPaywall existente pero modificado para mostrar el trial.

**Modificaciones al IAPPaywall:**

- Mostrar precio tachado + "GRATIS por 3 dias"
- Texto legal actualizado para trials
- Boton: "Empezar prueba gratis"

**Flujo:**

1. Mostrar resumen del trial (3 dias gratis)
2. Al presionar CTA, llamar `purchaseProduct()` con la oferta introductoria
3. Apple maneja el ingreso de tarjeta nativamente
4. Si exito: navegar a `/welcome-plus`
5. Si cancela: opcion de "Continuar gratis" -> `/dashboard`

---

## Integracion con Sistema Existente

### Modificar CommitmentScreen.tsx

Cambiar la navegacion de `/post-register-paywall` a `/trial-roulette`:

```typescript
// En handleComplete(), linea 101:
navigate('/trial-roulette', { replace: true });
```

### Agregar rutas en AnimatedRoutes.tsx

```typescript
import FreeTrialRoulette from '@/components/trial/FreeTrialRoulette';
import TrialWonCelebration from '@/components/trial/TrialWonCelebration';
import TrialTrustScreen from '@/components/trial/TrialTrustScreen';
import TrialActivation from '@/components/trial/TrialActivation';

// En las rutas publicas:
<Route path="/trial-roulette" element={<PageTransition><FreeTrialRoulette /></PageTransition>} />
<Route path="/trial-won" element={<PageTransition><TrialWonCelebration /></PageTransition>} />
<Route path="/trial-trust" element={<PageTransition><TrialTrustScreen /></PageTransition>} />
<Route path="/trial-activate" element={<PageTransition><TrialActivation /></PageTransition>} />
```

### Modificar useInAppPurchases.ts

Agregar soporte para detectar y mostrar precio de trial:

```typescript
interface IAPProduct {
  // ... campos existentes
  introductoryPrice?: string;
  introductoryPeriod?: string;
  hasIntroductoryOffer?: boolean;
}

// En el mapeo de productos del offering:
products.push({
  id: pkg.product.identifier,
  title: pkg.product.title,
  // ...
  introductoryPrice: pkg.product.introPrice?.priceString,
  introductoryPeriod: pkg.product.introPrice?.periodNumberOfUnits + ' ' + pkg.product.introPrice?.periodUnit,
  hasIntroductoryOffer: !!pkg.product.introPrice,
});
```

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/trial/FreeTrialRoulette.tsx` | Pantalla 1 - Ruleta gamificada |
| `src/components/trial/TrialWonCelebration.tsx` | Pantalla 2 - Celebracion de victoria |
| `src/components/trial/TrialTrustScreen.tsx` | Pantalla 3 - Pantalla de confianza |
| `src/components/trial/TrialActivation.tsx` | Pantalla 4 - Activacion con Apple IAP |
| `src/components/trial/index.ts` | Barrel exports |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/onboarding/CommitmentScreen.tsx` | Cambiar navegacion a `/trial-roulette` |
| `src/components/AnimatedRoutes.tsx` | Agregar 4 nuevas rutas |
| `src/hooks/useInAppPurchases.ts` | Agregar campos de introductory offer |

---

## Detalles de Implementacion de la Ruleta

**Matematicas de la animacion:**

```text
Segmentos (8 total, 45 grados cada uno):
- 0-45°: "1 dia"
- 45-90°: "Nada"
- 90-135°: "3 dias" <- TARGET
- 135-180°: "Nada"
- 180-225°: "2 dias"
- 225-270°: "Nada"
- 270-315°: "7 dias"
- 315-360°: "Nada"

Primer giro (pierde):
- Rotacion total: 1440° + 180° (5 vueltas + aterriza en "Nada")
- Duracion: 4 segundos
- Easing: cubic-bezier(0.17, 0.67, 0.12, 0.99)

Segundo giro (gana):
- Rotacion total: 1800° + 112.5° (5 vueltas + centro de "3 dias")
- Duracion: 5 segundos
- Easing: cubic-bezier(0.17, 0.67, 0.05, 0.99) (mas lento al final)
```

**Haptic pattern durante giro:**

```text
- Cada 200ms: selectionChanged() (simula "clicks" de ruleta)
- Al detenerse: mediumImpact()
- Si gana: successNotification() + celebrationPattern()
```

---

## Textos Completos ES/EN

```typescript
const texts = {
  es: {
    roulette: {
      title: "Gira para ganar dias gratis",
      spin: "Girar ruleta",
      spinAgain: "Girar de nuevo",
      almost: "Casi... Tienes otro intento!",
      won: "Ganaste!",
    },
    celebration: {
      title: "Ganaste",
      days: "dias gratis",
      subtitle: "de Chefly Plus!",
      continue: "Reclamar mi premio",
    },
    trust: {
      title: "Tranquilo, esto es seguro",
      subtitle: "Tu tranquilidad es nuestra prioridad",
      guarantees: [
        { title: "Cancela cuando quieras", desc: "Sin compromisos, sin preguntas" },
        { title: "Aviso 24h antes", desc: "Te recordamos antes del cobro" },
        { title: "Sin cargos hoy", desc: "No pagas nada hasta que termine el trial" },
        { title: "Pago seguro", desc: "Protegido por Apple" },
      ],
      cta: "Activar mi prueba gratis",
    },
    activation: {
      title: "Activa tu prueba",
      freeFor: "GRATIS por 3 dias",
      thenPrice: "Despues $7.99/mes",
      cta: "Empezar prueba gratis",
      skip: "Continuar sin prueba",
    },
  },
  en: {
    // ... equivalentes en ingles
  },
};
```

---

## Consideraciones de UX

1. **No hay boton de saltar en las primeras 3 pantallas** - El usuario debe completar el flujo. Solo en la pantalla 4 puede elegir "Continuar gratis".

2. **Momentum psicologico** - Cada pantalla construye sobre la anterior:
   - Ruleta: Suerte y emocion
   - Celebracion: Dopamina y recompensa
   - Confianza: Elimina objeciones
   - Activacion: Cierre facil

3. **Sonidos opcionales** - Considera agregar sonidos de ruleta girando y victoria (si `useCelebrationSounds` esta disponible).

4. **Persistencia** - Guardar en localStorage que el usuario ya vio el flujo para no repetirlo si vuelve.

---

## Orden de Implementacion

1. Configurar trial en App Store Connect (requisito previo)
2. Crear componentes de trial (4 pantallas)
3. Modificar CommitmentScreen para nueva navegacion
4. Agregar rutas en AnimatedRoutes
5. Modificar useInAppPurchases para introductory offers
6. Testing completo del flujo en dispositivo iOS

