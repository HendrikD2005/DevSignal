# DevSignal

Minimalistischer GitHub-to-LinkedIn Portfolio Generator.

DevSignal lädt öffentliche GitHub-Repositories, analysiert README und Sprachen und generiert daraus:

- erkannte Skills
- Portfolio-Score
- LinkedIn-Projektpost als Entwurf
- kopierbaren Text für manuelles Posten

## Tech Stack

- Vite
- React
- TypeScript
- Material UI
- Playwright
- GitHub Actions CI

## Start

```bash
npm install
npm run dev
```

Danach öffnen:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## End-to-End-Tests

```bash
npx playwright install chromium
npm run test:e2e
```

Die Playwright-Tests mocken die GitHub-API. Dadurch laufen sie stabil und unabhängig von Rate Limits.

## CI

Die GitHub Actions Pipeline liegt unter:

```text
.github/workflows/ci.yml
```

Sie führt aus:

1. Dependency Installation
2. TypeScript/Vite Build
3. Playwright Browser Installation
4. E2E Tests
5. Upload des Playwright Reports

## MVP-Grenzen

- Nur öffentliche GitHub-Repositories
- Keine GitHub OAuth Anmeldung
- Keine direkte LinkedIn API Integration
- LinkedIn-Text wird als Entwurf generiert und manuell kopiert
- Skill-Erkennung ist regelbasiert, noch nicht KI-basiert

## Nächste sinnvolle Features

- GitHub OAuth für private Repos und höhere Rate Limits
- Azure OpenAI / OpenAI für bessere Projekttexte
- Skill Graph über alle Repositories
- README-Verbesserungsvorschläge
- Export als PDF oder Portfolio-Card
- Projektvergleich nach Portfolio-Relevanz
