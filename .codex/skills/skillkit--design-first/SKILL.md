---
name: skillkit--design-first
description: Guides the creation of technical design documents before writing code, producing architecture diagrams, data models, API interface definitions, implementation plans, and multi-option trade-off analyses. Use when the user asks to plan a feature, architect a system, design an API, explore implementation approaches, or requests a technical design or spec before coding — especially for complex features involving multiple components, ambiguous requirements, or significant architectural changes.
version: 1.0.0
triggers:
  - design first
  - plan before code
  - architecture
  - how should I implement
  - design document
tags:
  - planning
  - design
  - architecture
  - thinking
difficulty: intermediate
estimatedTime: 20
relatedSkills:
  - planning/task-decomposition
  - planning/verification-gates
---

# Design First Methodology

You are following a design-first approach. Before writing any code, design the solution.

## Core Principle

**Think first, code second.**

## When to Use Design First

Apply this methodology when:

- Building a new feature or component
- Making significant architectural changes
- The task involves multiple components or systems
- Requirements are complex or ambiguous
- Multiple valid approaches exist

Skip for trivial changes (typos, simple bug fixes, config changes).

## Design Process

### Phase 1: Understand the Problem

Before designing, ensure clarity on:

**Requirements Checklist:**
- [ ] What is the user/business need?
- [ ] What are the inputs and outputs?
- [ ] What are the constraints (performance, security, compatibility)?
- [ ] What are the edge cases?
- [ ] What are the non-requirements (out of scope)?

**Questions to Ask:**
- What exactly should this do?
- What should it NOT do?
- How will users interact with it?
- How will it integrate with existing systems?
- What happens when things go wrong?

### Phase 2: Explore Options

Generate multiple approaches before choosing:

```markdown
## Option A: [Approach Name]

**Description:** [Brief explanation]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Complexity:** Low/Medium/High

---
name: skillkit--design-first
description: Guides the creation of technical design documents before writing code, producing architecture diagrams, data models, API interface definitions, implementation plans, and multi-option trade-off analyses. Use when the user asks to plan a feature, architect a system, design an API, explore implementation approaches, or requests a technical design or spec before coding — especially for complex features involving multiple components, ambiguous requirements, or significant architectural changes.
version: 1.0.0
triggers:
  - design first
  - plan before code
  - architecture
  - how should I implement
  - design document
tags:
  - planning
  - design
  - architecture
  - thinking
difficulty: intermediate
estimatedTime: 20
relatedSkills:
  - planning/task-decomposition
  - planning/verification-gates
---|---|
| Big Design Up Front (BDUF) | Design enough to start; refine as you learn |
| Analysis Paralysis | Time-box the design phase; decide at 70% confidence |
| Design in Isolation | Align with existing codebase patterns and team conventions |

## Integration with Implementation

After design is approved:

1. **Review the design** one more time before coding
2. **Break into tasks** using task-decomposition skill
3. **Implement incrementally** - verify design assumptions as you code
4. **Update design** if you discover issues during implementation

The design document is living — update it as you learn.

## Signals You Need More Design

- "I'm not sure where to start"
- "This is getting complicated"
- "I keep refactoring"
- "The requirements are unclear"
- "Multiple approaches seem valid"

Stop and design before proceeding.
