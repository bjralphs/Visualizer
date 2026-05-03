# Deployment and Release Notes

## Purpose
Document the build process, deployment steps, configuration, and release considerations for the Pathfinding Visualizer.

## Scope
`package.json`, `build/`, `public/`, `src/serviceWorker.js`.

---

## Build Process

The project uses Create React App (`react-scripts 3.1.2`).

### Scripts (`package.json`)

| Script | Command | Notes |
|---|---|---|
| `start` | `set NODE_OPTIONS=--openssl-legacy-provider && react-scripts start` | Local development server on port 3000 |
| `build` | `set NODE_OPTIONS=--openssl-legacy-provider && react-scripts build` | Production build output to `build/` |
| `predeploy` | `set NODE_OPTIONS=--openssl-legacy-provider && react-scripts build` | Runs automatically before `deploy` |
| `deploy` | `gh-pages -d build` | Publishes `build/` to GitHub Pages |
| `test` | `react-scripts test` | Jest test runner |
| `eject` | `react-scripts eject` | Irreversible CRA eject (not recommended) |

`NODE_OPTIONS=--openssl-legacy-provider` is required because the Node.js version in use has OpenSSL 3 by default, which is incompatible with Webpack 4 (bundled in `react-scripts 3.x`). This flag is a Windows-specific `set` command and will not work on Linux/macOS without modification.

---

## Configuration Management

| Config Key | Location | Value |
|---|---|---|
| `homepage` | `package.json` | `https://bjralphs.github.io/Visualizer` |
| `browserslist.production` | `package.json` | `>0.2%`, not dead, not op_mini all |
| `browserslist.development` | `package.json` | Last 1 Chrome/Firefox/Safari version |
| `PUBLIC_URL` | CRA environment variable | Derived from `homepage` at build time |
| `NODE_ENV` | CRA environment variable | `production` during build |

No `.env` files were found in the workspace. No custom environment variables are used beyond CRA defaults.

---

## Deployment Steps

### GitHub Pages Deployment
1. Ensure Node.js is installed and `npm install` has been run.
2. Run `npm run deploy`.
   - `predeploy` script runs `react-scripts build` first.
   - `deploy` script publishes the `build/` directory to the `gh-pages` branch via `gh-pages`.
3. GitHub Pages serves the content at `https://bjralphs.github.io/Visualizer`.

### Local Development
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000`.

---

## Environment Assumptions
- Windows OS (scripts use `set` for environment variables).
- Node.js version that requires `--openssl-legacy-provider` (Node 17+).
- `gh-pages` branch exists or will be created on the target GitHub repository.
- GitHub Pages is enabled for the repository.

---

## Database Setup / Migration Steps
None. The application has no database.

---

## Rollback Considerations
- GitHub Pages deployment can be rolled back by reverting the `gh-pages` branch to a previous commit and force-pushing.
- There is no server-side state, so rollback has no data impact.
- The previous `build/` output is not retained locally after a new build; ensure the previous deployment commit is tagged if rollback is needed.

---

## Release Checklist
- [ ] `npm test` passes.
- [ ] `npm run build` completes without errors or warnings.
- [ ] Application loads correctly at `localhost:3000` before deploying.
- [ ] All 13 algorithms run and animate correctly.
- [ ] All maze generators produce valid mazes.
- [ ] Responsive layout verified at common viewport sizes.
- [ ] `npm run deploy` completes and the live URL is accessible.

---

## Deployment Gaps
- No CI/CD pipeline; deployment is fully manual.
- `NODE_OPTIONS=--openssl-legacy-provider` is Windows-only; cross-platform contributors must adjust the scripts.
- No staging environment; changes go directly to production (GitHub Pages).
- No version tagging or changelog management process.
- Service worker is defined but not registered; PWA / offline capability is not active.

---

## Operational Concerns
- GitHub Pages has no server-side logic; the app is a static bundle.
- Cache busting is handled by CRA's content-hashed filenames (e.g., `main.aa556af0.chunk.js`).
- The `build/` directory is committed as part of the deployment but is not the source of truth; `src/` is.

---

## Known Gaps
- No automated deployment pipeline.
- No environment-specific configuration (dev vs. prod feature flags).
- Cross-platform build script incompatibility.

---

## Recommended Follow-up Work
1. Replace Windows-specific `set` with `cross-env` package for cross-platform compatibility.
2. Add a GitHub Actions workflow for automated build, test, and deploy on merge to `main`.
3. Upgrade `react-scripts` to a version compatible with current Node.js to eliminate the `--openssl-legacy-provider` workaround.
4. Tag releases with semantic version numbers.
