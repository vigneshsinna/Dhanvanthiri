# Skill Compatibility Report

Generated: 2026-03-06 20:34:53

## Sources
- anthropics-skills: 18 skills
- openai-skills: 38 skills
- skillkit: 14 skills
- superpowers: 14 skills
- Total: 84 skills

## Collision Analysis
- Duplicate original names detected (collision-safe due to namespacing):
  - openai-docs (2)
  - skill-creator (2)
  - pdf (2)

## Interference Controls Applied
- Only SKILL.md-based skill folders were installed.
- Non-skill global instruction files (e.g., AGENTS.md, CLAUDE.md, install docs) were not installed.
- Each skill was namespaced by source repo in frontmatter `name` to avoid cross-repo collisions.
- Skills were installed into isolated per-agent directories with identical namespaced folder names.

## Potentially Global Wording (Review Recommended)
- Flagged skills: 36
  - anthropics-skills--algorithmic-art (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\algorithmic-art\SKILL.md
  - anthropics-skills--canvas-design (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\canvas-design\SKILL.md
  - anthropics-skills--claude-api (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\claude-api\SKILL.md
  - anthropics-skills--doc-coauthoring (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\doc-coauthoring\SKILL.md
  - anthropics-skills--docx (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\docx\SKILL.md
  - anthropics-skills--skill-creator (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\skill-creator\SKILL.md
  - anthropics-skills--slack-gif-creator (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\slack-gif-creator\SKILL.md
  - anthropics-skills--webapp-testing (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\webapp-testing\SKILL.md
  - anthropics-skills--xlsx (anthropics-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\anthropics-skills\skills\xlsx\SKILL.md
  - openai-skills--chatgpt-apps (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\chatgpt-apps\SKILL.md
  - openai-skills--figma (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\figma\SKILL.md
  - openai-skills--figma-implement-design (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\figma-implement-design\SKILL.md
  - openai-skills--imagegen (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\imagegen\SKILL.md
  - openai-skills--openai-docs (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\openai-docs\SKILL.md
  - openai-skills--openai-docs-2 (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.system\openai-docs\SKILL.md
  - openai-skills--playwright (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\playwright\SKILL.md
  - openai-skills--render-deploy (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\render-deploy\SKILL.md
  - openai-skills--screenshot (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\screenshot\SKILL.md
  - openai-skills--security-best-practices (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\security-best-practices\SKILL.md
  - openai-skills--sentry (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\sentry\SKILL.md
  - openai-skills--skill-creator (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.system\skill-creator\SKILL.md
  - openai-skills--sora (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\sora\SKILL.md
  - openai-skills--spreadsheet (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\spreadsheet\SKILL.md
  - openai-skills--vercel-deploy (openai-skills) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\openai-skills\skills\.curated\vercel-deploy\SKILL.md
  - skillkit--root-cause-analysis (skillkit) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\skillkit\packages\core\src\methodology\packs\debugging\root-cause-analysis\SKILL.md
  - skillkit--testing-anti-patterns (skillkit) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\skillkit\packages\core\src\methodology\packs\testing\anti-patterns\SKILL.md
  - superpowers--brainstorming (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\brainstorming\SKILL.md
  - superpowers--finishing-a-development-branch (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\finishing-a-development-branch\SKILL.md
  - superpowers--receiving-code-review (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\receiving-code-review\SKILL.md
  - superpowers--requesting-code-review (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\requesting-code-review\SKILL.md
  - superpowers--systematic-debugging (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\systematic-debugging\SKILL.md
  - superpowers--test-driven-development (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\test-driven-development\SKILL.md
  - superpowers--using-git-worktrees (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\using-git-worktrees\SKILL.md
  - superpowers--verification-before-completion (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\verification-before-completion\SKILL.md
  - superpowers--writing-plans (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\writing-plans\SKILL.md
  - superpowers--writing-skills (superpowers) -> V:\pers\Freelance\Dhanvanthiri\.agent-skills\sources\superpowers\skills\writing-skills\SKILL.md

## Install Targets
- claude: .claude/skills
- codex: .codex/skills
- opencode: .opencode/skills
- gemini: .gemini/skills
- aider: .aider/skills
- cody: .cody/skills
- amazonq: .amazonq/skills
- copilot: .github/skills
- windsurf: .windsurf/skills
- devin: .devin/skills
- cursor: .cursor/skills
