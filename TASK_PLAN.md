# TASK_PLAN

Plan inicial escrito antes de codear.

## 1. Reconocimiento

- Stack: RN iOS.
- Features obligatorias: 6.
- Entregables: código + docs + evidencia.
- Fake API in-process (no backend).
- Solo iOS se evalúa.

## 2. Arquitectura propuesta

Capas: presentation / domain / data / services / config / core.

Estado: Redux Toolkit con slices por feature.

Navegación: React Navigation native-stack + linking.

Persistencia: Keychain para sesión, memoria para lo demás.

## 3. Riesgos

| Riesgo | Mitigación |
|---|---|
| New Arch rompe libs nativas | Probar audio primero, fallback documentado |
| Notifee requiere entitlement | Solo local notifications |
| Keychain falla en sim | Probar en device |
| Deep link no registra scheme | `CFBundleURLTypes` desde el inicio |
| Fake se pierde al reload | Aceptar como limitación |

## 4. Corte vertical
