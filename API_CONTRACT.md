# API_CONTRACT

Contrato del Fake API implementado en `src/data/fake/`. El mismo contrato se usará cuando exista backend real.

Base URL (fake): `in-process`
Base URL (real, futuro): `http://localhost:3000`

## Endpoints

### `POST /auth/session`

Login demo.

**Request:**
```json
{ "role": "coordinator" | "participant" }