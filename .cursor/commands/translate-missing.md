# Translate Missing Entries

## Task

Translate all missing Spanish translations in `locales/es.json`.

## Steps

1. **Open** `locales/es.json` in your editor.

2. **Find entries with empty string values** - Look for key-value pairs where the value is `""` (empty string).

3. **Translate the key** - The key is the English phrase. Translate it into Spanish.

4. **Replace the empty string** - Change the empty string `""` to the Spanish translation.

## Example

**Before:**
{
"Hello, world!": "",
"Welcome to my app": "Bienvenido a mi aplicación"
}**After:**n
{
"Hello, world!": "¡Hola, mundo!",
"Welcome to my app": "Bienvenido a mi aplicación"
}

## Notes

- Only translate entries where the value is `""` (empty string)
- Keep entries that already have Spanish translations unchanged
- The key (English phrase) should remain unchanged - only update the value
