# SECURITY

## Threat model — 5 amenazas

### 1. Escalación de privilegios vía UI manipulada

**Amenaza:** un Participant modifica el state de Redux o el JS bundle para forzar `kind: 'priority'` en `sendNote`.

**Mitigación:**
- La regla vive en `src/domain/permissions/index.ts`.
- El **Repository** valida antes de mandar (`canSendPriority(actorRole)`).
- El **fake API** valida también y devuelve 403.
- Test: `__tests__/notes-repository/notesRepository.test.ts` → `Participant NO puede enviar Priority (403)`.

**Evidencia:** el test pasa. Ocultar el botón es UX, no seguridad.

### 2. Robo de token desde almacenamiento

**Amenaza:** un atacante con acceso al filesystem lee el token de sesión.

**Mitigación:**
- Token guardado en **Keychain** (`react-native-keychain`), no en AsyncStorage.
- `accessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY` → no viaja a iCloud, no se sincroniza.
- Al hacer logout, `Keychain.resetGenericPassword()` borra la entrada.

### 3. IDOR (Insecure Direct Object Reference)

**Amenaza:** un usuario abre `signal://note/c-1/<noteId>` de un canal al que no pertenece.

**Mitigación:**
- El fake API devuelve 404 si la nota no existe o no pertenece al canal del usuario.
- La app muestra "Nota no encontrada" sin filtrar el motivo.
- En backend real: validar `channel.members.includes(userId)` en cada endpoint.

### 4. Fuga de PII en logs

**Amenaza:** tokens, texto de notas, URLs de audio o contenido sensible quedan en `console.log`.

**Mitigación:**
- `src/core/logger.ts` redacta automáticamente: `token`, `authorization`, `audio`, `url`, `text`, `content`.
- Regla autoimpuesta: nunca usar `console.log` directo en `src/` (solo `logger.*`).

**Verificación:**
```bash
grep -rn "console.log" src/ | grep -v "logger.ts"