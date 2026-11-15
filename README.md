# Sanando con Hellen

Landing público + app de miembros de meditaciones. Next.js 16 · React 19 · TypeScript · PostgreSQL (Drizzle) · Vercel.

- Brief y fuente de verdad: [`CLAUDE.md`](CLAUDE.md)
- Estado de la fase actual: [`docs/PHASE-1.md`](docs/PHASE-1.md)
- Dependencias justificadas: [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md)

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Pruebas

```bash
npm test
npm run build && npm run test:visual
```
