# Project Y

This is a new reader application for Hacker News built with [Vite](https://vite.dev/) + [React](https://react.dev/).

You can see it running live [right here on GitHub Pages](https://liamroddy.github.io/project-y/).

## Getting started

**Recommended:** use Node >=22 to build.

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

## Assumptions made
- For this initial POC I decided not to focus on accessibility and performance, though there is definitely room for improvement for both.
- I also decided to implement this as a single-page "reader" app for now, with no sign-in, posting, commenting etc. enabled.

If I was to continue working on the project past this point the above would be my next areas of focus.
