# Project Q&A

## Problem

**What was broken, missing, slow, confusing, expensive, or risky?**
- Users lacked an intuitive way to visualize and compare pathfinding algorithms, making it difficult to understand their differences and performance.

**Who had the problem?**
- Students, educators, and developers interested in learning or teaching pathfinding algorithms.

**Why did this matter to the business, users, team, or system?**
- It hindered effective learning and teaching, reducing engagement and understanding of algorithmic concepts.

**Was this a real user need, a technical limitation, a stakeholder request, or a self-directed improvement?**
- A real user need identified through feedback from educators and learners.

**What was the cost of doing nothing?**
- Continued reliance on static, less engaging resources like textbooks and slides, leading to suboptimal learning outcomes.

**Can the problem be stated in one strong sentence?**
- "Learners lacked an interactive tool to explore and compare pathfinding algorithms, limiting their ability to grasp key concepts."

---

## Research

**How did you know this was the right problem?**
- Feedback from educators and learners highlighted the need for an interactive learning tool.

**Did you talk to users, stakeholders, teammates, managers, or customers?**
- Yes, discussions were held with educators and students.

**Did you inspect logs, analytics, support tickets, workflows, database records, or existing UI behavior?**
- Existing educational tools and resources were reviewed for gaps.

**What surprised you during research?**
- Many users struggled with visualizing algorithm behavior despite theoretical knowledge.

**What assumptions did you have at the start?**
- Users needed a tool to visualize algorithm steps.

**Which assumptions were confirmed?**
- Visualization aids understanding.

**Which assumptions were wrong?**
- Initially underestimated the importance of comparing multiple algorithms side-by-side.

**What constraints did you discover?**
- Limited screen space for displaying multiple visualizations simultaneously.

---

## Ideation

**What options did you consider before choosing the final solution?**
- A static dashboard, a single-algorithm visualizer, and a multi-algorithm comparison tool.

**Did you compare multiple technical or UX approaches?**
- Yes, evaluated static vs dynamic visualizations.

**What did you reject, and why?**
- Rejected static dashboards due to lack of interactivity.

**Was there a simpler solution you avoided?**
- Avoided a single-algorithm visualizer as it didn’t meet the need for comparison.

**Was there a more ambitious solution you postponed?**
- Postponed adding advanced analytics for algorithm performance.

**What tradeoffs did you make between speed, maintainability, usability, cost, accessibility, performance, or scope?**
- Prioritized usability and interactivity over advanced analytics.

**Did you sketch flows, data models, wireframes, API contracts, or architecture alternatives?**
- Yes, created wireframes and flow diagrams for the user interface.

---

## Design

**What exactly did you design?**
- Designed the UI, workflow, and algorithm visualization logic.

**What were the key design decisions?**
- Focused on simplicity and clarity in visualizing algorithm steps.

**Why is the final design better than the old version?**
- It provides real-time, interactive visualizations and side-by-side comparisons.

**How did you reduce complexity for the user?**
- Simplified controls and provided clear instructions.

**How did you handle edge cases?**
- Accounted for scenarios like unreachable nodes and invalid inputs.

**What constraints shaped the design?**
- Screen space and the need for responsive design.

**What screenshots, diagrams, flows, or before/after comparisons can prove this?**
- Wireframes and before/after comparisons of static vs interactive tools.

---

## Testing

**How did you know the solution worked?**
- Conducted user testing with students and educators.

**Did users try it?**
- Yes, feedback was collected from initial users.

**Did QA test it?**
- Yes, edge cases and performance were tested.

**Did you write unit, integration, regression, or manual test cases?**
- Wrote unit and integration tests for core functionalities.

**Did you test edge cases?**
- Yes, including unreachable nodes and invalid inputs.

**Did you test performance?**
- Yes, ensured smooth rendering for large grids.

**Did you validate accessibility or responsiveness?**
- Yes, tested on various devices and ensured keyboard navigation.

**What bugs or issues came up during testing?**
- Discovered and fixed a bug in the grid rendering logic.

**What changed after feedback?**
- Improved the algorithm selection interface based on user suggestions.

**Did you launch gradually, behind a flag, or all at once?**
- Launched all at once after thorough testing.

---

## Outcome

**What improved?**
- Users gained an interactive way to learn and compare algorithms.

**Can you quantify the result?**
- Increased user engagement and positive feedback from educators.

**Did time decrease?**
- Reduced time to understand algorithm behavior.

**Did errors decrease?**
- N/A for this project.

**Did conversion increase?**
- N/A for this project.

**Did support tickets drop?**
- N/A for this project.

**Did adoption increase?**
- Yes, widely adopted by educators and students.

**Did manual work get automated?**
- Automated visualization of algorithm steps.

**Did page load time improve?**
- Optimized for fast rendering.

**Did developers gain maintainability?**
- Yes, modular design improved maintainability.

**Did stakeholders get better visibility?**
- Yes, clear visualizations improved understanding.

**Did the project ship?**
- Yes, successfully launched.

**Is it currently used?**
- Yes, actively used by the target audience.

**What would you improve next?**
- Add advanced analytics and support for more algorithms.