

# Plan: Paywall Post-Registro de Alta Conversión

## Resumen

Crear una pantalla de paywall que aparezca **inmediatamente después del registro** para maximizar la conversión de nuevos usuarios a Chefly Plus. El paywall será fullscreen con botón de cerrar, mostrará una comparativa clara Free vs Premium, y seguirá el estilo visual de la app.

## Diagrama del Flujo

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Onboarding     │────▶│   NUEVO         │────▶│   Dashboard     │
│  (Paso 29)      │     │   PostRegister  │     │   (Normal)      │
│  Auth Step      │     │   Paywall       │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │ ❌ Cerrar
        │                       ▼
        │               ┌─────────────────┐
        │               │   Dashboard     │
        └──────────────▶│   (Free user)   │
           (Si ya        └─────────────────┘
            existía)
```

## Componentes a Crear/Modificar

### 1. Nueva Página: `PostRegisterPaywall.tsx`
Pantalla fullscreen inspirada en `PremiumPaywall.tsx` y `WelcomePlusScreen.tsx` con:

**Estructura Visual:**
- Botón ❌ cerrar (esquina superior derecha)
- Mascota celebrando + título motivacional
- Tabla comparativa "Free vs Plus" estilo 2 columnas
- Lista de beneficios premium con checkmarks
- Botón CTA principal que abre `IAPPaywall`
- Texto "Continuar gratis" como alternativa sutil

**Beneficios a mostrar:**

| Característica | Gratis | Chefly Plus |
|----------------|--------|-------------|
| Plan semanal | 1 plan | Ilimitados ✨ |
| Escaneo IA | ❌ | Ilimitado 📸 |
| Chat Chef IA | ❌ | $2 USD/mes 💬 |
| Intercambio comidas | ❌ | ✅ |
| Sistema de amigos | ❌ | ✅ |

### 2. Modificar `PreOnboarding.tsx`
En la función `handleAuthSuccess`:
- Para **usuarios nuevos** (`isNewUser === true`): redirigir a `/post-register-paywall`
- Para **usuarios existentes**: mantener redirección a `/dashboard`

### 3. Agregar Ruta en `AnimatedRoutes.tsx`
Nueva ruta pública: `/post-register-paywall`

## Detalles de Implementación

### PostRegisterPaywall.tsx

```typescript
// Características principales:
- Fullscreen con safe-area para iOS notch
- Botón X cerrar → navega a /dashboard
- Animaciones Framer Motion escalonadas
- Tabla comparativa Free vs Plus (diseño de 2 columnas)
- IAPPaywall integrado para compra nativa iOS
- Soporte bilingüe (ES/EN)
- Mascota con emojis flotantes (estilo PremiumPaywall)
```

### Cambio en PreOnboarding.tsx (línea ~257)

```typescript
// Antes:
navigate('/dashboard', { replace: true });

// Después:
if (isNewUser) {
  navigate('/post-register-paywall', { replace: true });
} else {
  navigate('/dashboard', { replace: true });
}
```

## Diseño Visual

El paywall seguirá el sistema de diseño existente:
- **Colores**: Gradientes lime/cyan (primary/secondary)
- **Tipografía**: Font bold para títulos, muted para descripciones
- **Iconografía**: Lucide icons con estilos 3D (gradientes)
- **Animaciones**: Spring animations, floating elements
- **Cards**: Rounded corners, subtle borders, glassmorphism

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/PostRegisterPaywall.tsx` | **NUEVO** - Página de paywall post-registro |
| `src/pages/PreOnboarding.tsx` | Cambiar navegación post-auth para nuevos usuarios |
| `src/components/AnimatedRoutes.tsx` | Agregar ruta `/post-register-paywall` |

## Sección Técnica

### Flujo de Estado
1. Usuario completa onboarding y crea cuenta
2. `handleAuthSuccess` detecta `isNewUser === true`
3. Navega a `/post-register-paywall`
4. Usuario puede:
   - Comprar → `IAPPaywall` → `/welcome-plus` → `/dashboard`
   - Cerrar (X) → `/dashboard` (como usuario free)
   - "Continuar gratis" → `/dashboard`

### Integración con Pagos
- Reutiliza `IAPPaywall` existente para Apple In-App Purchase
- `userId` se obtiene de la sesión activa
- On success: redirige a `/welcome-plus` (celebración existente)

### Consideraciones de UX
- El paywall solo aparece para **nuevos registros**, no para logins
- El botón cerrar está siempre visible y accesible
- La opción "Continuar gratis" refuerza que no es obligatorio
- Diseño mobile-first optimizado para iOS

