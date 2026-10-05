# SELF_REVIEW

## Qué funciona

- ✅ Sesión demo con Keychain + restore al boot + manejo de 401
- ✅ Canal con roles y capacidades reflejadas en UI
- ✅ Timeline con estados (QUEUED → DISPATCHED → DELIVERED → OPENED)
- ✅ Compositor: destinatario, texto, preset, Standard/Priority
- ✅ Confirmación antes de emitir Priority
- ✅ Priority oculto para Participant (UI + Repository 403)
- ✅ Idempotencia (misma key no duplica)
- ✅ Dedupe por `noteId` en el timeline
- ✅ Deep link `signal://note/:channelId/:noteId`
- ✅ NoteDetail con respuestas vinculadas (`replyToId`)
- ✅ Notificación local con `interruptionLevel: timeSensitive`
- ✅ Notificación dispara deep link (foreground + cold start)
- ✅ Tests: 19 pasando

## Qué no funciona

- ❌ Audio (3 librerías fallaron — ver KNOWN_LIMITATIONS)
- ❌ Persistencia del fake al reload
- ❌ Cancelación cross-device
- ❌ Expiración automática de notas
- ❌ E2E (solo unit + integration)

## Defectos conocidos

1. Al logout no se limpian notas de otros slices que no sean Channel.
2. Timer de grabación no testeado en unmount.
3. Deep link `signal://` requiere rebuild cada vez que se toca `Info.plist`.

## Riesgos de producción

- Fake API in-memory no apto para prod.
- Notifee no reemplaza APNs.
- Keychain sin biometría.
- Sin rate limiting.
- Logger redacta PII pero `console.log` suelto podría filtrar.

## Deuda técnica

| Área | Deuda |
|---|---|
| Tests | E2E, NotificationService |
| Audio | Interfaz lista, implementación no |
| Offline | Sin queue persistente |
| i18n | Todo hardcodeado en español |
| Performance | Sin profile con 1000+ notas |

## Qué cambiaría con 2 días más

1. Audio con RN 0.74 + Old Arch + audio-recorder probado.
2. Detox E2E.
3. Persistencia del fake en AsyncStorage.
4. Cancelación cross-device + expiración.
5. `correlationId` en cada request.

## Qué código revisé con más cuidado

- `src/domain/permissions/index.ts` — revisado 3 veces
- `src/data/fake/handlers.ts` — `authorId` hardcodeado, visto en revisión manual
- `src/presentation/session/sessionSlice.ts` — `logoutThunk` no limpiaba `error`
- `NotificationService.ts` — `interruptionLevel` puede asustar al revisor de App Store
- `RootNavigator.tsx` — el `key` en `NavigationContainer` fue hack necesario

## Qué rechacé del agente

- Parcheo de `node_modules` vía postinstall para audio
- JWT fake firmado (no hace falta simular cripto)
- AsyncStorage para token (viola seguridad del challenge)