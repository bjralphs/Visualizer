# User and Stakeholder Map

## Purpose
Identify all users and stakeholders of the Pathfinding Visualizer, their needs, and their concerns.

## Scope
Public-facing application at `https://bjralphs.github.io/Visualizer`.

---

## Primary Users

### Student / Learner
- **Description:** Undergraduate or self-taught developer studying graph algorithms, data structures, or interview preparation.
- **Primary need:** Visual, interactive understanding of how algorithms differ in exploration behaviour and path quality.
- **Usage pattern:** Runs multiple algorithms on the same grid, compares visited node patterns, reads complexity info in the sidebar.
- **Key concern:** Does this algorithm find the shortest path? How does it compare to A*?
- **Pain points (pre-tool):** Reliance on static diagrams, code traces, or YouTube videos that do not allow experimentation.

---

### Educator / Instructor
- **Description:** Computer science lecturer, tutor, or technical trainer.
- **Primary need:** A live, demonstrable tool to show algorithm differences in lectures or screencasts.
- **Usage pattern:** Generates structured mazes, runs algorithms sequentially, projects the screen to students.
- **Key concern:** Does the tool represent algorithms accurately and clearly?
- **Pain points (pre-tool):** No interactive tool that can be used live without setup or installation.

---

## Secondary Users

### Developer / Engineer (Practitioner)
- **Description:** Working software engineer refreshing knowledge for a job change or technical interview.
- **Primary need:** Quick, tangible reminder of algorithm properties and visual behaviour.
- **Usage pattern:** One or two algorithm runs, reads the sidebar for complexity and use cases.
- **Key concern:** Is the information accurate? Are the algorithms implemented correctly?

---

## Admin / Support Users
None. There is no admin interface, user management system, or support queue. The application is fully self-service.

---

## Technical Maintainers

### `bjralphs` (Sole Developer / Maintainer)
- **Responsibilities:** Feature development, bug fixes, deployment, documentation.
- **Tools:** React, Create React App, GitHub Pages, `gh-pages` npm package.
- **Key concerns:**
  - Build stability (Node.js / OpenSSL compatibility).
  - Algorithm correctness.
  - Deployment reliability.
  - No CI/CD pipeline to catch regressions.
- **Constraints:** Solo project; limited time for major refactors.

---

## Decision-Makers
`bjralphs` is the sole decision-maker for feature prioritisation, technology choices, and deployment timing.

---

## Stakeholder Needs and Concerns Summary

| Stakeholder | Primary Need | Key Concern |
|---|---|---|
| Student | Visual, interactive algorithm exploration | Algorithm accuracy; ease of use |
| Educator | Live demonstration tool | Representational accuracy; no setup friction |
| Practitioner developer | Quick algorithm refresher | Correctness; credibility of metadata |
| Maintainer | Reliable, maintainable codebase | Build stability; no automated testing |

---

## Operational Concerns
- There is no mechanism to collect user feedback, bug reports, or feature requests beyond GitHub issues.
- No analytics are configured to understand user behaviour or adoption.

---

## Known Gaps
- No formal user research has been conducted (`Needs verification`).
- No user feedback channel is linked from the application UI (beyond the GitHub link in the sidebar).

---

## Recommended Follow-up Work
- Add a feedback link or GitHub issue template visible in the UI.
- Set up anonymous usage analytics (e.g., Plausible, GoatCounter) to understand user behaviour.
