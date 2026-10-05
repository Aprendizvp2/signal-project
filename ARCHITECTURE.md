# ARCHITECTURE

## Capas

┌─────────────────────────────────────────┐
│ presentation/ (UI + Redux slices) │
│ screens, components, hooks │
└──────────────┬──────────────────────────┘
│ dispatch thunks
┌──────────────▼──────────────────────────┐
│ domain/ (reglas puras, sin RN) │
│ models, permissions, usecases │
└──────────────┬──────────────────────────┘
│ importa tipos
┌──────────────▼──────────────────────────┐
│ data/ (repositories, api, storage) │
│ ├── repositories/ (interface pública) │
│ ├── fake/ (impl. in-process) │
│ ├── api/ (cliente HTTP) │
│ └── storage/ (Keychain) │
└──────────────┬──────────────────────────┘
│
┌──────────────▼──────────────────────────┐
│ services/ (adapters nativos) │
│ audio/, notifications/, telemetry/ │
└─────────────────────────────────────────┘

## Flujo de una nota
ComposerScreen
→ dispatch(sendNote(input)) [presentation]
→ notesRepository.send(input, key) [data]
→ fakeApi.createNote(dto, key) [data/fake]
→ valida permisos [domain/permissions]
→ guarda en db.notes
→ simula transición de estados
→ mapNote(dto) → Note [data]
→ upsertNote(note) en el slice [presentation]
→ timeline re-renderiza

## Responsabilidades por capa

| Capa | Sabe de | NO sabe de |
|---|---|---|
| presentation | Redux, RN, navegación | HTTP, fake, Keychain |
| domain | Modelos puros | RN, Redux, HTTP |
| data | DTOs, fake, axios, Keychain | RN, Redux |
| services | APIs nativas iOS | Redux, dominio |

## Reglas duras

1. **`domain/` no importa nada de `react-native`.** Es TypeScript puro.
2. **Un solo lugar decide Priority:** `src/domain/permissions/index.ts`. Ni la UI ni el Repository duplican la regla.
3. **Los modelos de dominio son independientes del JSON.** Los DTOs viven en `data/types.ts` y se mapean en cada Repository.
4. **Los errores son tipados.** `AppError` con `kind: 'network' | 'auth' | 'forbidden' | ...`.
5. **Los adapters nativos son reemplazables.** `AudioService`, `NotificationService` exponen interfaces, no implementaciones.

## Estado (Redux)
store/
├── session user, token, loading, hydrating, error, pendingDeepLink
├── channel current, loading, error
└── notes byId, ids, loading, sending, error

`byId` + `ids` normalizado. Dedupe por `note.id` en `upsertNote`.

## Navegación
RootNavigator (Stack)
├── Login
├── Channel (initialParams: { channelId: 'c-1' })
├── Composer (requiere { channelId })
└── NoteDetail (requiere { channelId, noteId })

Deep link configurado en `navigation/linking.ts`:
signal://note/:channelId/:noteId → NoteDetail
signal://channel/:channelId → Channel

## Ciclo de vida

- **Boot**: `restoreSession()` desde Keychain → `hydrating = false` → render.
- **Logout**: `logoutThunk` limpia Keychain + Redux → `key` en `NavigationContainer` cambia → remount → Login.
- **Deep link con app cerrada**: `Linking.getInitialURL()` → `pendingDeepLink` en el slice → después del login, navega.
- **Notificación con app cerrada**: `notifee.getInitialNotification()` → `navigationRef.navigate(...)`.

## Manejo de errores

| Status | AppError.kind | Acción |
|---|---|---|
| 401 | `auth` | `setUnauthorized()` → logout + remount |
| 403 | `forbidden` | muestra alert, no reintenta |
| 404 | `not_found` | pantalla vacía con "Volver" |
| 409 | `conflict` | muestra error (ej. invite ya usada) |
| 422 | `validation` | error de formulario |
| 500 | `server` | retry disponible |
| timeout / sin red | `network` / `timeout` | retry manual |
