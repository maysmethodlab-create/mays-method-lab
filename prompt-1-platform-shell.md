# Prompt 1: Build the Mays Method Lab Platform

## What You Are Building

Build the **platform shell** for the Mays Method Lab website at Mays Business School, Texas A&M University. This is the container that will host multiple AI-powered academic admin tools. Think of it like a portal: the platform provides the website, navigation, authentication, and design system. Individual "apps" (like the Evaluation Letter Writer) plug into the Admin Tools section.

In this prompt, you are building only the shell. The first app (Evaluation Letter Writer) has its own separate prompt that builds inside this shell.

The platform will be deployed on **Render** and the code lives in the **maysmethodlab** GitHub organization.

---

## Design System: Cinematic Dark Theme with TAMU Maroon Accents

The design draws from two sources: the official Texas A&M brand system (Aggie Maroon, typography) and a cinematic dark UI style inspired by https://praxis-simulation.onrender.com/. The result should feel like a premium research lab tool, not a standard university web page. Dark, confident, polished.

### Colors
- **Background (primary)**: `#050505` (near-black)
- **Background (cards/panels)**: `#141414` (dark gray)
- **Background (elevated surfaces)**: `#0a0a0a`
- **Borders**: `rgba(255, 255, 255, 0.08)` (very subtle white)
- **Aggie Maroon (accent/CTA)**: `#500000`
- **Maroon hover**: `#8C2633`
- **Maroon glow**: `rgba(80, 0, 0, 0.4)` (for button hover glow effects)
- **Text primary**: `#FAFAFA` (near-white)
- **Text secondary**: `#A1A1AA` (muted gray)
- **Text muted**: `#71717A`
- **Success**: `#3D6B2E`
- **Warning**: `#C8A415`
- **Error**: `#BF3D3D`
- **White (for headings)**: `#FFFFFF`

### Typography
- **Headline font**: `"Tungsten", "Oswald", sans-serif` (Tungsten is the TAMU headline font; Oswald is the free Google Font fallback)
- **Body font**: `"Inter", "Helvetica Neue", sans-serif` (clean, modern, highly readable on dark backgrounds)
- **Hero title**: `clamp(40px, 6vw, 72px)`, weight 800, letter-spacing `-0.04em`, line-height 0.95
- **Section eyebrow labels**: 14-18px, uppercase, letter-spacing `0.25em`, weight 600, colored in Aggie Maroon
- **Body text**: 16-18px, weight 300-400, line-height 1.7, color `#A1A1AA`
- **Card headings**: 20-24px, weight 700, color `#FAFAFA`

### Hero Section with Background Video

The home page hero section uses a **full-screen looping background video** with layered overlays and staggered text animations. This is the signature visual element.

**Structure:**
```html
<section class="hero-section">
  <div class="hero-video-wrap">
    <video class="hero-video" autoplay loop muted playsinline>
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-eyebrow anim-fade-up">MAYS METHOD LAB</div>
    <h1 class="hero-title anim-fade-up">Discover the Next Way.</h1>
    <p class="hero-sub anim-fade-up">AI-powered tools for academic leaders...</p>
    <div class="hero-buttons anim-fade-up">...</div>
  </div>
  <div class="scroll-indicator anim-fade-up">SCROLL</div>
</section>
```

**Hero CSS:**
```css
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-video-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(5,5,5,0.85), rgba(5,5,5,0.5), rgba(5,5,5,0.3)),
    linear-gradient(to top, rgb(5,5,5) 0%, rgba(5,5,5,0.8) 8%, transparent 25%),
    linear-gradient(rgba(5,5,5,0.6) 0%, transparent 15%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 80px;
  width: 100%;
}

.hero-eyebrow {
  text-transform: uppercase;
  font-size: 18px;
  letter-spacing: 0.25em;
  color: #500000;
  font-weight: 600;
  margin-bottom: 28px;
}

.hero-title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.95;
  max-width: 800px;
  margin-bottom: 28px;
  color: #FAFAFA;
}

.hero-sub {
  font-size: 18px;
  color: #A1A1AA;
  max-width: 520px;
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 48px;
}
```

**Hero video fallback**: If no `.mp4` file is provided initially, implement a CSS-only animated background. A slowly morphing gradient in dark maroon tones, or a subtle CSS particle animation, will hold the space until a proper video is produced.

### Staggered Fade-Up Animations

All hero elements and scroll-revealed sections use a signature animation: elements fade in from below with a slight blur, staggered by 0.2s.

```css
@keyframes animFadeUp {
  0% {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.anim-fade-up {
  opacity: 0;
  animation: animFadeUp 0.8s ease-out forwards;
}

.hero-eyebrow.anim-fade-up { animation-delay: 0.2s; }
.hero-title.anim-fade-up { animation-delay: 0.4s; }
.hero-sub.anim-fade-up { animation-delay: 0.6s; }
.hero-buttons.anim-fade-up { animation-delay: 0.8s; }
.scroll-indicator.anim-fade-up { animation-delay: 1.4s; }
```

### Scroll-Triggered Section Reveals

Use the Intersection Observer API to trigger fade-up animations as sections scroll into view.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('anim-fade-up');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
```

### Scroll Indicator Pulse

```css
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.scroll-indicator {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #A1A1AA;
  animation: scrollPulse 2s ease-in-out infinite;
}
```

### Card and Panel Styling

```css
.card {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.card:hover {
  border-color: rgba(80, 0, 0, 0.5);
  box-shadow: 0 0 30px rgba(80, 0, 0, 0.15);
}
```

### Button Styling

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 36px;
  background: #500000;
  color: #FAFAFA;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s, transform 0.25s;
}

.btn-primary:hover {
  background: #8C2633;
  box-shadow: 0 0 24px rgba(80, 0, 0, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  padding: 16px 36px;
  background: transparent;
  color: #A1A1AA;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #FAFAFA;
}
```

### Progress Indicators

```css
@keyframes phaseFade {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.progress-bar {
  height: 2px;
  background: linear-gradient(90deg, transparent, #500000, transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, TypeScript, Tailwind CSS (with custom dark TAMU theme)
- **Backend**: Next.js API routes
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) -- individual apps specify which models and how
- **Authentication**: For v1, implement a simple password gate using an environment variable (`ADMIN_PASSWORD`). Structure the auth middleware so it can be swapped to TAMU CAS SSO later. Add a comment: `// TODO: Replace with TAMU CAS SSO (https://cas.tamu.edu). Users will authenticate via their NetID.`
- **Deployment**: Render (Web Service for the Next.js app)
- **State management**: React state + server actions. No database needed for v1.

---

## Page Structure

### Tab 1: Home

A cinematic landing page for the Mays Method Lab.

**Hero section (full viewport height):**
- Maroon eyebrow label: "MAYS METHOD LAB"
- Headline: "Discover the Next Way."
- Subtitle: "The Mays Method Lab exists to discover, test, and codify a new way of teaching business for the AI era."
- Two CTA buttons: "Admin Tools" (maroon, primary) and "Learn More" (ghost/secondary)
- Background: looping video or animated gradient
- Scroll indicator at bottom

**Mission section (scroll-revealed):**
- Section eyebrow: "OUR MISSION"
- Brief paragraph about the Lab's purpose: working in the tradition of a research and development lab inside a great university, producing pedagogical innovations that can eventually be branded, disseminated, and exported as the Mays Method.

**Vision section (scroll-revealed):**
- Section eyebrow: "OUR VISION"
- Brief paragraph: within five years, recognized as the leading center of pedagogical invention in American business education.

**Leadership section (scroll-revealed):**
- Co-Directors: Levi Belnap, 'Jon Jasperson, Shrihari Sridhar
- Brief one-line descriptions

**Footer:**
- Mays Business School and Texas A&M University branding
- Dark footer matching the page aesthetic

**DO NOT include** the three-track cards (Breakthrough Pedagogy, Community and Capability, Venture and Technology Transfer). Keep the home page simple and clean.

### Tab 2: Admin Tools (requires authentication)

This is a **container page** for multiple tools. After login, the user sees a grid/list of available tools (cards). For v1, there is only one tool: the **Evaluation Letter Writer**. But the page architecture should support adding more tools later.

Each tool card shows:
- Tool name (e.g., "Evaluation Letter Writer")
- One-line description
- "Launch" button that navigates to the tool's own page

The Evaluation Letter Writer lives at `/admin/evaluation-letters/` and is built by Prompt 2.

### Tab 3: About

Brief page about the Mays Method Lab leadership and mission. Dark theme, consistent with the rest of the site.

---

## Shell File Structure

```
mays-method-lab/
  src/
    app/
      page.tsx                    # Home tab (cinematic landing page)
      admin/
        page.tsx                  # Admin tools grid (tool cards)
        layout.tsx                # Auth wrapper for all admin pages
        evaluation-letters/       # ← This is built by Prompt 2
          page.tsx
          ...
      about/
        page.tsx                  # About tab
      api/
        auth/
          route.ts                # Auth endpoint (placeholder for TAMU SSO)
      layout.tsx                  # Root layout with header/nav
    components/
      Header.tsx                  # Dark header with nav tabs
      Footer.tsx                  # Mays/TAMU dark footer
      HeroSection.tsx             # Full-screen hero with video background
      ScrollReveal.tsx            # IntersectionObserver wrapper component
      LoginForm.tsx               # Auth form (password now, SSO later)
      ToolCard.tsx                # Card component for Admin Tools grid
    styles/
      globals.css                 # Tailwind + dark TAMU custom theme
      animations.css              # All animation keyframes and classes
  public/
    hero-bg.mp4                   # Hero background video (or use CSS animation fallback)
    tamu-logo-white.png           # White TAMU/Mays logo for dark backgrounds
    mays-method-lab-logo.svg      # Lab wordmark
  tailwind.config.ts              # Custom dark TAMU color palette
  .env.local                      # ANTHROPIC_API_KEY, ADMIN_PASSWORD
  render.yaml                     # Render deployment config
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_PASSWORD=...
# Future: TAMU_CAS_SERVICE_URL, TAMU_CAS_VALIDATE_URL
```

---

## Render Deployment

Create a `render.yaml`:
```yaml
services:
  - type: web
    name: mays-method-lab
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: NODE_ENV
        value: production
```

---

## Key Implementation Notes

1. **SSO readiness**: Structure the auth layer so it can be replaced with TAMU CAS SSO. The current password gate is a placeholder.

2. **Texas A&M naming conventions** (enforce in all generated text):
    - "Texas A&M University" on first reference, "Texas A&M" thereafter
    - "Mays Business School" on first reference, "Mays" thereafter
    - Serial comma only when needed for clarity (AP style)
    - Titles lowercase after name ("Nate Sharp, dean of Mays Business School")
    - Titles capitalized before name ("Dean Nate Sharp")

3. **Admin Tools extensibility**: The Admin Tools page should render tool cards dynamically from a config array. This makes it easy to add new tools later without restructuring the page.

4. **Error handling**: Clear error messages, retry capability, no lost work.

5. **File size limits**: Cap uploads at 10MB per file. Show a clear error if exceeded.

6. **Rate limiting**: Add basic rate limiting on API routes (e.g., max 10 requests per minute per session).

---

## What to Build (MVP)

1. Set up the Next.js project with the dark TAMU design system (colors, fonts, animations)
2. Build the Home page with hero section (video or CSS fallback), mission, vision, and leadership
3. Build the Login page and auth middleware (password for now, SSO-ready)
4. Build the Admin Tools container page with the tool card grid
5. Set up the `/admin/evaluation-letters/` route as a placeholder (Prompt 2 fills this in)
6. Build the About page
7. Build the Header with nav tabs and Footer
8. Deploy the shell to Render and confirm it works
9. Then move to Prompt 2 to build the Evaluation Letter Writer inside the shell

---

## Phase 2 Notes (Future Enhancements -- Do Not Build Yet)

These are architectural decisions for the next major version. Leave them as comments or a roadmap doc, not code.

- **Database**: Add PostgreSQL (via Render) or Supabase to store faculty profiles (name, rank, department, track, appointment date, hire date), historical evaluation letters, uploaded CVs and self-evaluations, department head preferences and letterhead templates, and evaluation history over time. This turns the app from a stateless tool into a persistent evaluation management system.
- **TAMU CAS SSO**: Replace the password gate with TAMU CAS/Shibboleth authentication. Auto-populate the writer dropdown based on the authenticated user's NetID and role.
- **Faculty roster management**: An admin interface for department heads to manage their faculty rosters (add/remove people, update titles and tracks, upload updated CVs).
- **Letter archive**: Store generated letters and make them searchable by year, person, and department.
- **Staff evaluation version**: A second app in the Admin Tools section for staff evaluations (different workflow and letter structure than faculty evaluations).
- **Multi-department dashboard**: For the Senior Associate Dean to see evaluation status across all departments.
- **Letterhead templates**: Per-department letterhead images stored in the database and automatically applied to generated .docx files.
