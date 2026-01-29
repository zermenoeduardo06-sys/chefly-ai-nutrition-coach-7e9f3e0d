# Plan: Corrección del Flash del Nombre de Otro Usuario

## ✅ COMPLETADO

### Cambios Implementados

1. **`src/contexts/AuthContext.tsx`** - Agregado `previousUserIdRef` para detectar cambios de usuario y limpiar cache automáticamente cuando el userId cambia (no solo en logout).

2. **`src/pages/Dashboard.tsx`** - 
   - useEffect de userId ahora siempre sincroniza con `authUser.id` 
   - Nuevo useEffect que resetea todo el estado local (`profile`, `mealPlan`, `userStats`, etc.) cuando cambia el userId

3. **`src/components/DashboardHeader.tsx`** - Agregado prop `isProfileLoading` para mostrar "Chef" como fallback mientras se carga el perfil del nuevo usuario.

### Flujo Corregido

```text
1. Usuario A logout → AuthContext detecta cambio → queryClient.clear()
2. Usuario B login → Dashboard detecta nuevo userId → reset de todo estado local
3. UI renderiza: "Buenos días, Chef" (fallback seguro)
4. loadProfile() completa
5. UI actualiza: "Buenos días, María" (nombre correcto)
```

**Resultado**: Nunca habrá flash del nombre del usuario anterior.
