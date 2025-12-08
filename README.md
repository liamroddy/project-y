# Hacker News++

A modern, responsive reader application for **Hacker News** built with [Vite](https://vite.dev/) + [React](https://react.dev/).

🚀 **[View Live Demo on GitHub Pages](https://liamroddy.github.io/project-y/)**

## 🛠️ Building the App

**Recommended:** Node >=22

### 💻 Development build:

```bash
npm install
npm run dev
```

### 🏗️ Production build:

```bash
npm install
npm run build
npm run preview
```

## ✨ Code Quality

- `npm run lint` - Runs ESLint with strict TypeScript + React 19 rules
- `npm run format` / `npm run format:check` - Uses Prettier 3 for consistent code styling

## 🧪 Tests and Coverage

- `npm run test` - Executes the Jest suite
- `npm run test:coverage` - Runs tests with Sonar coverage check

## 📝 Next Steps

- For this initial POC I decided not to focus on **accessibility** and **performance**, though there is definitely room for improvement for both.
    - Story comment section fetching and rendering especially needs a total rework!
- I decided to implement this as a single-page "reader" app for now, with no sign-in, posting, commenting etc. enabled.
- I also decided to just focus on unit and component testing to start, since this is a small, single page app without any complicated flows and is very easy to manually verify nothing is broken after changes. Higher level testing, like UI and E2E testing, would be good to implement as the app grows in complexity.
