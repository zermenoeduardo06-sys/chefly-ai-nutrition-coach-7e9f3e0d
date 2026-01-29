

# Plan: Input de Chat Siempre Visible (Estilo WhatsApp/ChatGPT)

## Problema Identificado

En **ChefIA.tsx**, el input de texto está dentro del área scrollable, lo que causa que pueda desplazarse fuera de la vista. En apps como WhatsApp, Messenger y ChatGPT, el input siempre está fijo en la parte inferior.

### Comparación de Layouts

| Archivo | Estructura Actual | Problema |
|---------|-------------------|----------|
| **Chat.tsx** | Input fuera del scroll, `flex-shrink-0` | Correcto |
| **ChefIA.tsx** | Input dentro del contenedor scrollable | Se mueve con el scroll |

---

## Solución: Reestructurar ChefIA.tsx

### Estructura Actual (ChefIA.tsx líneas 682-810)
```
<div className="min-h-full flex flex-col">
  <header>...</header>
  
  <div className="flex-1 container px-4 py-4 flex flex-col overflow-hidden">
    <ScrollArea className="flex-1">
      {/* Messages */}
    </ScrollArea>
    
    <form className="mt-3 pb-24">  ← DENTRO del contenedor scrollable
      {/* Input */}
    </form>
  </div>
</div>
```

### Estructura Nueva (estilo Chat.tsx)
```
<div className="h-[100dvh] flex flex-col overflow-hidden">
  <header className="flex-shrink-0">...</header>
  
  <ScrollArea className="flex-1 min-h-0">
    {/* Messages */}
  </ScrollArea>
  
  <div className="flex-shrink-0 border-t pb-safe">  ← FUERA del scroll
    {/* Input siempre visible */}
  </div>
</div>
```

---

## Cambios Específicos

### 1. Contenedor Principal
**Antes:**
```tsx
<div className="min-h-full bg-gradient-to-b ... flex flex-col">
```

**Después:**
```tsx
<div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
```

### 2. Área de Mensajes
**Antes:**
```tsx
<div className="flex-1 container mx-auto px-4 ... flex flex-col max-w-3xl overflow-hidden">
  <ScrollArea className="flex-1 -mx-4 ...">
    {/* mensajes */}
  </ScrollArea>
  
  <motion.form className="mt-3 ... pb-24">
    {/* input */}
  </motion.form>
</div>
```

**Después:**
```tsx
<ScrollArea className="flex-1 min-h-0">
  <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
    {/* mensajes */}
  </div>
</ScrollArea>

{/* Input FUERA del scroll, siempre visible */}
<motion.div className="border-t border-border/50 bg-card/90 backdrop-blur-xl px-4 py-3 flex-shrink-0 pb-safe">
  <form onSubmit={handleSend} className="flex items-end gap-2 max-w-3xl mx-auto">
    {/* Textarea auto-expandible en lugar de Input */}
  </form>
</motion.div>
```

### 3. Mejorar el Input (textarea auto-expandible)
**Antes:** `<Input />` de una sola línea

**Después:** `<textarea>` que crece con el contenido (como WhatsApp)
```tsx
<textarea
  ref={inputRef}
  value={input}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  placeholder={t("chat.placeholder")}
  disabled={loading}
  rows={1}
  className="w-full resize-none rounded-2xl border-2 border-border bg-background px-4 py-3 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 min-h-[48px] max-h-[120px]"
  style={{ height: '48px' }}
/>
```

---

## Mejoras Visuales Adicionales

| Elemento | Mejora |
|----------|--------|
| **Borde superior** | `border-t border-border/50` para separar del chat |
| **Backdrop blur** | `backdrop-blur-xl` para efecto glass moderno |
| **Safe area** | `pb-safe` para dispositivos con home indicator |
| **Botón enviar** | Sombra `shadow-lg shadow-primary/20` para profundidad |
| **Animación** | Entrada suave con `initial/animate` de framer-motion |

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ChefIA.tsx` | Reestructurar layout: sacar input del scroll, usar textarea |

---

## Resultado Visual Esperado

```
┌────────────────────────────────────┐
│  [←]  🍋 Chefly                  🔊 │  ← Header fijo
├────────────────────────────────────┤
│                                    │
│  [🍋] Hola! ¿Cómo puedo ayudarte? │  ↑
│                                    │  │
│            Pregunta aquí  [Tú]    │  │ Área scrollable
│                                    │  │
│  [🍋] Respuesta del coach...      │  ↓
│                                    │
├────────────────────────────────────┤
│  ┌─────────────────────────┐  [→] │  ← Input SIEMPRE visible
│  │ Escribe tu mensaje...   │      │
│  └─────────────────────────┘      │
└────────────────────────────────────┘
    ↑ Safe area respetada
```

---

## Funcionalidad del Textarea

- **Enter** = Enviar mensaje
- **Shift+Enter** = Nueva línea
- **Auto-expand** = Crece hasta 120px máximo
- **Auto-shrink** = Vuelve a 48px al enviar

