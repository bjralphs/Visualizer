# Production Incident Case Study

## Purpose
Provide a structured incident response template for the Pathfinding Visualizer. No verified production incidents are on record. This document serves as a ready-to-use template for future incident documentation.

> **Note:** This is a template. No real production incident is documented here. Fill in each section when an actual incident occurs.

---

## Incident Response Template

### Summary
> One-paragraph description of what happened, when, and what was affected.

*Example: On [DATE], users visiting [URL] experienced [SYMPTOM] for approximately [DURATION]. The issue was caused by [ROOT CAUSE] and was resolved by [ACTION].*

---

### Impact

| Dimension | Detail |
|---|---|
| **User impact** | *e.g., All users unable to run algorithms; page displayed blank* |
| **Duration** | *e.g., 45 minutes* |
| **Scope** | *e.g., 100% of visitors to GitHub Pages URL* |
| **Data loss** | *None expected — application has no persistent state* |
| **Severity** | *P1 / P2 / P3 / P4* |

---

### Timeline

| Time (UTC) | Event |
|---|---|
| HH:MM | Incident began |
| HH:MM | First detected |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Incident resolved / monitoring confirmed |

---

### Detection
> How was the issue discovered? User report, automated alert, or developer observation?

*This application has no automated monitoring. Detection would rely on user reports or the developer noticing a broken deployment.*

---

### Root Cause
> What was the underlying technical cause?

*Common candidates for this application:*
- A build failure that produced a broken `build/` bundle.
- A `gh-pages` deployment that published an incomplete or corrupt `build/` directory.
- A browser incompatibility with an animation or CSS feature.
- An unhandled exception in an algorithm's `setTimeout` callback that broke the animation loop.
- `react-scripts` or Node.js version mismatch causing a broken build.

---

### Resolution
> What steps were taken to resolve the issue?

1. *Identified the broken deployment commit.*
2. *Reverted the `gh-pages` branch to the last known-good commit.*
3. *Verified the live URL was restored.*
4. *Root-caused the failure and applied a fix.*
5. *Re-deployed via `npm run deploy`.*

---

### Follow-up Actions

| Action | Owner | Due |
|---|---|---|
| Add CI/CD to prevent broken deployments | Engineering | — |
| Add external uptime monitoring | Engineering | — |
| Add Sentry error tracking | Engineering | — |
| Document rollback procedure | Engineering | — |

---

### Lessons Learned
> What did this incident teach us about the system, process, or tooling?

*Template prompts:*
- What monitoring gap allowed the issue to go undetected?
- What would have caught this in testing?
- What deployment process improvement would prevent recurrence?

---

## Known Risks for This Application

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Broken `gh-pages` deployment | Medium | High | Add CI/CD with build verification |
| Algorithm `setTimeout` callback error not caught by `ErrorBoundary` | Medium | Medium | Wrap callbacks in `try/catch` |
| Node.js upgrade breaks `--openssl-legacy-provider` workaround | High | High | Upgrade `react-scripts` |
| Browser caching stale bundle after deploy | Low | Medium | Verify content-hash filenames in build output |

---

## Operational Concerns
- No external monitoring exists. An incident could go undetected indefinitely.
- Rollback requires manual Git operations on the `gh-pages` branch.

---

## Recommended Follow-up Work
- Set up an uptime monitor (e.g., UptimeRobot, GitHub Actions cron ping).
- Add Sentry to `ErrorBoundary.componentDidCatch`.
- Document and test the rollback procedure before it is needed.
