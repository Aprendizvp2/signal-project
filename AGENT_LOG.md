# AGENT_LOG

Registro del uso de agentes de código durante el desarrollo del challenge Signal.

## Herramientas utilizadas

- **Cursor + Claude** (agente principal): scaffolding, iteración de features, debugging nativo iOS.
- **ChatGPT** (consulta puntual): errores de compilación de Swift/Xcode.
- **GitHub Copilot** (autocompletado): snippets repetitivos (estilos, mocks de tests).

## Estrategia general

### División del trabajo

| Tipo de tarea | Delegado al agente | Revisado manualmente |
|---|---|---|
| Scaffolding RN + navegación | ✅ | ✅ |
| Modelos de dominio y permisos | ❌ | ✅ (crítico) |
| Slices de Redux | ✅ | ✅ |
| Fake API + Repository | ✅ | ✅ |
| Compositor de notas | ✅ | ✅ |
| Integración nativa iOS (Keychain, Notifee) | ❌ | ✅ (crítico) |
| Tests unitarios | ✅ | ✅ |
| ADRs y documentación | ✅ | ✅ |
| Decisiones de seguridad | ❌ | ✅ (crítico) |

### Regla autoimpuesta

> Todo código generado que toca **permisos**, **tokens** o **datos sensibles** se revisa línea por línea antes de commitear. El agente nunca decide la política de seguridad.

## Actividades diarias

### 1. Revisión de seguridad diaria

Antes de cerrar cada sesión de trabajo, corrí un checklist:

```bash
# 1. Buscar tokens, URLs o contenido en logs
grep -rn "console.log\|logger\." src/ | grep -v "REDACTED"

# 2. Verificar que las mutaciones usan Idempotency-Key
grep -rn "api.post\|api.patch" src/ | grep -v "idempotencyKey"

# 3. Revisar que no haya `any` sin justificar en archivos críticos
grep -rn ": any" src/domain/ src/data/repositories/

# 4. Confirmar que la regla de Priority vive en un solo lugar
grep -rn "priority" src/ | grep -v "domain/permissions"