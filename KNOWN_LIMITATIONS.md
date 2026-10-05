# KNOWN_LIMITATIONS

## 1. Audio — no integrado

La feature de audio **no se pudo completar** dentro del tiempo del challenge.

### Intentos y resultados

| Librería | Resultado |
|---|---|
| `react-native-nitro-sound` + `react-native-nitro-modules` | No compila con Xcode 16.4 (símbolo `allowBluetoothHFP` no existe en el SDK actual) |
| `react-native-audio-recorder-player@3.6.2` | `startRecorder` es `null` en runtime (incompatible con New Architecture) |
| `react-native-audio-api` (Software Mansion) | Errores de compilación en C++ host objects con RN 0.76+ |

### Decisión

Se abandonó la integración tras ~4 horas de debugging nativo. Se priorizó:

1. Que la app compile y ejecute en iOS (requisito de descarte).
2. Que el resto de las features obligatorias funcionen end-to-end.
3. Documentar el fallo con evidencia.

### Lo que sí queda hecho

- Interfaz `AudioService` en `src/services/audio/` como adapter reemplazable.
- Hook `useRecorder` con máquina de estados (`idle` → `recording` → `recorded` → `error`).
- Modelo de dominio ya tiene `audioUrl?: string` en `Note` y `NoteDTO`.
- UI del compositor con bloque de audio listo para reactivar.
- Límites definidos: 60s de duración, 5MB de tamaño.

### Impacto en criterios de aceptación

| # | Criterio | Estado |
|---|---|---|
| 8 | Audio reproduce, pausa, reanuda y libera recursos | ❌ |
| 14 | Evidencia real iOS | ✅ (sin audio) |

### Qué se haría con más tiempo

1. Fijar RN a 0.74 (Old Arch) + `audio-recorder-player@3.6.2` (combinación probada).
2. O contribuir un fix a `react-native-nitro-sound` para Xcode 16+.

---

## 2. Persistencia del fake API

El fake vive **en memoria**. Al hacer reload de Metro, las notas y canales se pierden (excepto la sesión, que persiste en Keychain).

**Por qué:** el challenge no exige backend real y el fake está diseñado para tests determinísticos.

**Fix futuro:** guardar `db.notes` y `db.channels` en AsyncStorage al mutar.

---

## 3. Cancelación cross-device de Priority

El fake no soporta `POST /delivery-events` con `event: 'responded-elsewhere'`. El campo `respondedFromDeviceId` existe en el modelo pero no hay trigger que lo dispare.

---

## 4. Expiración automática de Priority vieja

No hay timer que pase notas a `EXPIRED`. El estado existe en el enum pero no se transiciona solo.