
# Plan: Corregir Guideline 5.1.1 - Eliminar botón "Más tarde" en paso de Apple Health

## Problema

Apple rechazó la app porque el paso de HealthKit en el onboarding tiene un botón "Más tarde" / "Maybe later" que permite al usuario evitar el diálogo de permisos. Según la Guideline 5.1.1, si muestras una pantalla informativa antes del permiso de HealthKit, el usuario **siempre debe llegar al diálogo de permisos del sistema** -- no puede haber una opción de salir antes.

## Solución

Eliminar el botón "Más tarde" y hacer que el único camino sea presionar "Conectar Apple Health", que mostrará el diálogo nativo de permisos de iOS. Después de que el usuario responda al diálogo (acepte o rechace), se avanza automáticamente al siguiente paso.

### Cambios en `src/components/onboarding/OnboardingHealthStep.tsx`

1. **Eliminar la prop `onSkip`** de la interfaz del componente (ya no se necesita).
2. **Eliminar el botón "Más tarde"** (líneas 172-178).
3. **Modificar `handleConnect`** para que siempre avance al siguiente paso después de la solicitud de permisos, independientemente de si el usuario aceptó o rechazó:

```typescript
const handleConnect = async () => {
  setConnecting(true);
  await requestAuthorization();
  setConnecting(false);
  setConnected(true);
  setTimeout(() => onNext(), 1500);
};
```

4. Actualizar el mensaje de la mascota para que sea informativo sin ser una pregunta (ya no hay opción de declinar):
   - ES: "Vamos a conectar Apple Health para que tus metas sean más precisas basándose en tu actividad real."
   - EN: "Let's connect Apple Health so your goals are more accurate based on real activity."

### Cambios en `src/pages/PreOnboarding.tsx`

- Eliminar la prop `onSkip` del componente `OnboardingHealthStep` (línea ~749).

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/onboarding/OnboardingHealthStep.tsx` | Eliminar botón skip, siempre avanzar tras permiso |
| `src/pages/PreOnboarding.tsx` | Quitar prop `onSkip` |
