# Project Y

This is a basic [Vite](https://vite.dev/) + [React](https://react.dev/) front-end wrapper for Hacker News.

## Getting started

Use Node >=22 to build.

### Development build:

```bash
npm install
npm run dev
```

### Production build:

```bash
npm install
npm run build
npm run preview
```

## Code quality

- `npm run lint` runs ESLint with strict TypeScript + React 19 rules.
- `npm run format` (and `npm run format:check`) use Prettier 3 to keep the codebase consistently styled.

## Tests and coverage

- `npm run test` executes the Jest suite.
- `npm run test:coverage` runs the tests with Sonar check for coverage.
