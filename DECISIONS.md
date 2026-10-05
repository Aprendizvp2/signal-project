# DECISIONS

## ADR-001: Fake API in-process en TypeScript

**Contexto:** el challenge provee un contrato de API pero no exige backend.

**Decisión:** implementar el fake como módulo TS puro en `src/data/fake/`.

**Alternativas:** json-server, MSW, Express local.

**Por qué:** cero setup, tests determinísticos, misma interfaz que un cliente HTTP real (Repository pattern). La UI no sabe si habla con fake o real.

**Trade-off:** estado volátil al reload. Aceptado.

---

## ADR-002: Old Architecture (New Arch OFF)

**Contexto:** RN 0.76+ trae New Arch por defecto. 3 librerías de audio fallaron al compilar con ella.

**Decisión:** desactivar New Arch en `Podfile` + `Info.plist`.

**Alternativas:** mantener New Arch y sacrificar audio (mismo resultado).

**Por qué:** prioridad es que compile y ejecute. Old Arch + RN 0.76 es combinación estable.

**Trade-off:** sin TurboModules.

**Reversible:** 2 líneas.

---

## ADR-003: Keychain para sesión, no AsyncStorage

**Contexto:** el token es sensible.

**Decisión:** `react-native-keychain` con `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.

**Por qué:** estándar iOS para credenciales. No sincroniza a iCloud.

**Trade-off:** solo strings. Serializamos JSON.

---

## ADR-004: Notifee como adapter de notificaciones

**Contexto:** demostrar Priority en iOS sin entitlements de Apple.

**Decisión:** Notifee con `interruptionLevel: 'timeSensitive'`.

**Alternativas:** APNs real (cuenta paga), PushNotificationIOS (deprecado).

**Por qué:** expone la API moderna de iOS y el adapter queda listo para reemplazar por push real.

**Trade-off:** no es push real. Documentado como fake.

---

## ADR-005: Audio no integrado

Ver `KNOWN_LIMITATIONS.md`.

**Decisión:** no integrar y dejar la interfaz lista.

**Por qué:** costo de oportunidad. 4h sin resultado.

---

## ADR-006: Redux Toolkit

**Contexto:** estado global moderadamente complejo.

**Alternativas:** Zustand, Jotai, Context.

**Por qué:** `createAsyncThunk` se integra con Repository, devtools, selectores tipados.

**Trade-off:** boilerplate. Aceptado.