# Mays Method Lab: Getting Started with Claude Code

## Folder Structure

```
Mays Method Lab/
  CLAUDE-CODE-START-HERE.md          <-- You are here
  prompt-1-platform-shell.md         <-- Website/platform build spec
  Mays Guidelines October17.2025.Approved.pdf   <-- Official Mays evaluation guidelines
  apps/
    Annual Evaluation Letters/       <-- First app (everything it needs is self-contained here)
      prompt-2-evaluation-letter-writer.md   <-- App build spec
      letter-skills/                 <-- Per-category letter structure and tone reference
      writing-style-skills/          <-- Human-writing rules and evaluation conventions
      evaluation-letter-writer-skill/   <-- AI pipeline reference docs
      Template Letters/              <-- 14+ real department head letters (voice/tone reference)
      original-monolithic-prompt.md  <-- Archive: the original combined prompt (for reference only)
```

Future apps (e.g., Staff Evaluation Writer, Course Assignment Planner) will each get their own subfolder under `apps/` with their own prompt, skills, and reference materials.

---

## How to Build: Step by Step

### Phase A: Build the Platform Shell

1. **Create a project folder** on your machine:
   ```
   mkdir mays-method-lab
   cd mays-method-lab
   ```

2. **Initialize a git repo** and connect to the maysmethodlab GitHub org:
   ```
   git init
   gh repo create maysmethodlab/mays-method-lab --private --source=.
   ```

3. **Copy this entire "Mays Method Lab" folder** into the project so Claude Code can access all reference materials.

4. **Open Claude Code** in the project folder:
   ```
   claude
   ```

5. **Tell Claude Code to build the platform shell:**
   ```
   Read the file prompt-1-platform-shell.md. This is the specification for the Mays Method Lab website platform. Follow it precisely. Build the project step by step, committing after each major milestone. Start with the MVP build order at the bottom.
   ```

6. **Set up environment variables.** Create a `.env.local` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-...   (your Anthropic API key)
   ADMIN_PASSWORD=...             (a temporary password for the admin section)
   ```

7. **Verify the shell works.** You should see:
   - Home page with cinematic hero, mission, vision, leadership sections
   - Login page that accepts the admin password
   - Admin Tools page with a placeholder card for the Evaluation Letter Writer
   - About page
   - Dark TAMU-themed design throughout

### Phase B: Build the Evaluation Letter Writer App

8. **Once the shell is working**, tell Claude Code to build the first app:
   ```
   Read the file apps/Annual Evaluation Letters/prompt-2-evaluation-letter-writer.md. This is the specification for the Evaluation Letter Writer app, which plugs into the platform shell you just built. Also read the letter-skills/ folder for the per-category letter structure reference. Build the app step by step, committing after each milestone.
   ```

9. **Test the full pipeline:**
   - Select a writer from the dropdown
   - Upload a sample self-evaluation and CV (use files from Template Letters/ as examples)
   - Type some notes in the free-text area
   - Generate a letter and verify the three phases work
   - Download the .docx and check formatting

### Phase C: Deploy to Render

10. **Push to GitHub:**
    ```
    git add .
    git commit -m "Initial build of Mays Method Lab"
    git push -u origin main
    ```

11. **Deploy on Render:**
    - Connect the GitHub repo to Render via the dashboard, OR
    - Use Blueprint deployment with the `render.yaml` already in the project
    - Add environment variables (ANTHROPIC_API_KEY, ADMIN_PASSWORD) in the Render dashboard

---

## What Each Prompt Contains

**Prompt 1 (Platform Shell)** covers:
- Cinematic dark theme with TAMU Maroon accents, hero video section, animations
- Tech stack: Next.js 14+, React, TypeScript, Tailwind CSS
- Three pages: Home, Admin Tools (container for apps), About
- Authentication (password gate now, TAMU CAS SSO later)
- Admin Tools extensibility (card grid from config array)
- Render deployment config
- Phase 2 future notes (database, SSO, faculty roster, letter archive, staff version)

**Prompt 2 (Evaluation Letter Writer)** covers:
- Four-step workflow: Setup, Upload, Generate, Download
- Writer dropdown with department heads
- Role-category-specific evaluation logic (8 categories from Mays Guidelines)
- Per-area ratings (Teaching, Research, Service) using the Mays 4-level scale
- Three-phase AI pipeline with complete prompts (Research, Draft, Verify)
- Letter-skill integration (loads the right template for each faculty type)
- Human-writing rules (banned words, structural rules, tone calibration)
- Batch upload mode for evaluating multiple faculty at once
- .docx generation with proper formatting
- Accompanying email generation

---

## Tips for Working with Claude Code

- If Claude Code asks which file to read, point it to the relevant prompt file
- Claude Code can re-read the prompt anytime it needs to check a specification
- Commit frequently so you can roll back if needed
- The letter-skills/ files are reference materials for the AI, not code to build. Claude Code should read them to understand how letters should be structured, then embed those patterns into the prompts
- The Template Letters/ folder contains real letters from department heads. These are the gold standard for tone and structure
