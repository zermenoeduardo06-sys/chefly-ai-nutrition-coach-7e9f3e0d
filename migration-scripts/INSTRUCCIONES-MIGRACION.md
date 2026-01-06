# 🚀 Guía de Migración a Supabase Pro

## Resumen
Esta guía te ayudará a migrar tu proyecto Chefly de Lovable Cloud a tu propio Supabase Pro.

---

## 📋 Pre-requisitos

1. ✅ Tener una cuenta en [Supabase](https://supabase.com)
2. ✅ Crear un nuevo proyecto en Supabase (o usar uno existente vacío)
3. ✅ Tener acceso al SQL Editor de Supabase

---

## 🔧 Paso 1: Ejecutar Schema Migration

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor** (menú lateral)
3. Haz clic en **New Query**
4. Copia TODO el contenido del archivo `01-schema-migration.sql`
5. Pégalo en el editor
6. Haz clic en **Run**

⏱️ **Tiempo estimado:** 30-60 segundos

### ✅ Verificación:
- Ve a **Table Editor** y confirma que ves las 32 tablas
- Ve a **Authentication > Policies** y confirma las políticas RLS
- Ve a **Database > Functions** y confirma las 14 funciones

---

## 📊 Paso 2: Insertar Datos Base

1. En SQL Editor, crea una **New Query**
2. Copia TODO el contenido de `02-data-migration.sql`
3. Pégalo y haz clic en **Run**

### ✅ Verificación:
- Tabla `achievements`: 15 registros
- Tabla `affiliate_tiers`: 5 registros
- Tabla `subscription_plans`: 3 registros

---

## 🍳 Paso 3: Migrar Recetas (Opcional)

Las 339 recetas ocupan mucho espacio. Si quieres migrarlas:

1. Ejecuta el archivo `03-recipes-migration.sql` (cuando esté disponible)

**Alternativa:** Las recetas se generarán automáticamente cuando los usuarios creen planes de comida.

---

## 🔐 Paso 4: Configurar Secrets en Edge Functions

Ve a **Project Settings > Edge Functions > Secrets** y añade:

| Nombre | Descripción |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Tu clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe |
| `LOVABLE_API_KEY` | Tu API key de Lovable (para IA) |
| `RESEND_API_KEY` | API key de Resend (para emails) |
| `RAPIDAPI_KEY` | API key de RapidAPI (opcional) |

---

## 🔗 Paso 5: Reconectar Lovable

### 5.1 Obtener credenciales de tu Supabase Pro

En tu dashboard de Supabase:
1. Ve a **Project Settings > API**
2. Copia:
   - **Project URL** (ej: `https://abc123.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)
   - **service_role secret key** (para Edge Functions)

### 5.2 Conectar en Lovable

1. Abre tu proyecto en Lovable
2. Ve a **Settings** (⚙️ en la esquina)
3. Navega a **Connectors**
4. Busca **Supabase**
5. Ingresa:
   - Project URL
   - Anon Key
   - Service Role Key
6. Haz clic en **Connect**

---

## 🔄 Paso 6: Configurar Auth

En Supabase Dashboard:

1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** está habilitado
3. Ve a **Authentication > Settings**
4. Marca **Enable email confirmations** como deshabilitado (auto-confirm)

### Opcional: Google OAuth
1. Ve a **Authentication > Providers > Google**
2. Ingresa tu Client ID y Client Secret de Google Cloud Console

---

## 🗄️ Paso 7: Verificar Storage Buckets

Los buckets se crean automáticamente con el script. Verifica en **Storage**:

- ✅ `avatars` (público)
- ✅ `recipe-images` (público)
- ✅ `food-scans` (público)
- ✅ `assets` (público)

---

## 🧪 Paso 8: Probar la Aplicación

1. Regresa a Lovable y recarga la preview
2. Intenta registrar un nuevo usuario
3. Completa el onboarding
4. Verifica que se genera el plan de comidas
5. Prueba marcar una comida como completada

---

## 🐛 Solución de Problemas

### Error: "permission denied for table X"
- Revisa las políticas RLS en **Authentication > Policies**
- Asegúrate de que el usuario está autenticado

### Error: "function X does not exist"
- Re-ejecuta la sección de funciones del script de schema

### Error al conectar desde Lovable
- Verifica que copiaste las URLs y keys correctamente
- Asegúrate de que el proyecto de Supabase está activo

### Las imágenes de recetas no cargan
- Las URLs apuntan al proyecto anterior. Las nuevas recetas generarán nuevas imágenes.

---

## 📞 Soporte

Si tienes problemas con la migración:
1. Revisa los logs en **Supabase > Logs**
2. Verifica la consola del navegador en Lovable
3. Contacta soporte con los mensajes de error específicos

---

## ✨ ¡Listo!

Una vez completados todos los pasos, tu aplicación Chefly estará funcionando con tu propio Supabase Pro, con acceso completo al dashboard, backups automáticos, y 8GB de espacio de base de datos.
