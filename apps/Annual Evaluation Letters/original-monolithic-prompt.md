# Claude Code Prompt: Build the Mays Method Lab Admin App

## What You Are Building

Build a full-stack web application for the **Mays Method Lab** at Mays Business School, Texas A&M University. This is an internal tool that helps academic leaders (department heads, associate deans) produce high-quality, human-sounding evaluation letters for their direct reports: tenure-track faculty, APT faculty, staff, and other roles. The app lives at the Mays Method Lab website and will eventually have multiple tabs for different AI-powered academic admin tools; the first and most important tab is the **Evaluation Letter Writer**.

The app will be deployed on **Render** and the code lives in the **maysmethodlab** GitHub organization.

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
  <!-- Background video layer -->
  <div class="hero-video-wrap">
    <video class="hero-video" autoplay loop muted playsinline>
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
  
  <!-- Gradient overlay (makes text readable over video) -->
  <div class="hero-overlay"></div>
  
  <!-- Content layer -->
  <div class="hero-content">
    <div class="hero-eyebrow anim-fade-up">MAYS METHOD LAB</div>
    <h1 class="hero-title anim-fade-up">Discover the Next Way.</h1>
    <p class="hero-sub anim-fade-up">AI-powered tools for academic leaders...</p>
    <div class="hero-buttons anim-fade-up">...</div>
  </div>
  
  <!-- Scroll indicator -->
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

/* Triple-layered gradient overlay */
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
  color: #500000; /* Aggie Maroon */
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

**For the hero background video**: Use a subtle, abstract motion video. Good options:
- A slow-moving aerial view of Texas A&M campus
- Abstract flowing particles or light trails in maroon tones
- A subtle mesh/grid animation with slow movement
- If no video is available initially, use a CSS-only animated gradient or particle effect as a placeholder

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

/* Stagger delays for hero elements */
.hero-eyebrow.anim-fade-up { animation-delay: 0.2s; }
.hero-title.anim-fade-up { animation-delay: 0.4s; }
.hero-sub.anim-fade-up { animation-delay: 0.6s; }
.hero-buttons.anim-fade-up { animation-delay: 0.8s; }
.scroll-indicator.anim-fade-up { animation-delay: 1.4s; }
```

### Scroll-Triggered Section Reveals

Use the Intersection Observer API to trigger fade-up animations as sections scroll into view. Each section's content should animate in when it enters the viewport.

```javascript
// Use IntersectionObserver for scroll-triggered animations
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

Cards use the dark glass-morphism aesthetic:

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
/* Primary CTA - Maroon */
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

/* Secondary / Ghost */
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

### Progress Indicators During AI Processing

When the three-phase pipeline is running, use animated elements:

```css
@keyframes phaseFade {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Animated progress bar in maroon */
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
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) for the three-phase letter pipeline
- **Document generation**: `docx` npm package for creating .docx files on the server
- **File upload**: Accept .docx and .pdf uploads (use `mammoth` for .docx text extraction, `pdf-parse` for PDF text extraction)
- **Authentication**: Texas A&M SSO (CAS/Shibboleth) integration. For v1, implement a simple password gate using an environment variable (`ADMIN_PASSWORD`) as a placeholder, but structure the auth middleware so it can be swapped to TAMU CAS SSO later. Add a comment in the auth code: `// TODO: Replace with TAMU CAS SSO (https://cas.tamu.edu). Users will authenticate via their NetID.`
- **Deployment**: Render (Web Service for the Next.js app)
- **State management**: React state + server actions. No database needed for v1 (everything happens in a single session).

---

## App Structure

### Tab 1: Home

A cinematic landing page for the Mays Method Lab. Dark background, hero video, bold typography, scroll-triggered reveals.

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

This is the evaluation letter writer. After login, the user sees a clean interface with these steps:

**Step 1: Setup**

The writer identifies themselves from a **dropdown of hardcoded department heads and leaders**. When they select their name, the title and department auto-fill. Include these leaders (update this list as needed):

```javascript
const WRITERS = [
  { name: "Keith Wilcox, Ph.D.", title: "Department Head, Department of Marketing", department: "Department of Marketing" },
  { name: "Rich Metters, Ph.D.", title: "Department Head, Department of Information and Operations Management", department: "Department of Information and Operations Management" },
  { name: "Sean McGuire, Ph.D.", title: "Department Head, James Benjamin Department of Accounting", department: "James Benjamin Department of Accounting" },
  { name: "James (Jamie) Brown, Ph.D.", title: "Department Head, Adam C. Sinn '00 Department of Finance", department: "Adam C. Sinn '00 Department of Finance" },
  { name: "Srikanth Paruchuri, Ph.D.", title: "Department Head, Department of Management", department: "Department of Management" },
  // Add more as needed
];
```

After selecting themselves:
- Text input: Evaluation year (pre-filled with previous calendar year)
- Auto-calculated display: **Evaluation period** (the full fiscal year for overall evaluation, and the last three fiscal years for research activities). These dates are auto-calculated from the evaluation year and displayed for reference. Example: "Evaluation Year: 2025. Overall evaluation period: FY2025. Research evaluation window: FY2023-FY2025." *(Note: the exact date ranges will be finalized based on the department head template; placeholder logic for now.)*
- Text input: Recipient's full name (the person being evaluated)
- Text input: Recipient's title/role
- **Dropdown: Recipient's role category** (determines how the letter is framed and which performance areas apply). These categories come directly from Section 2 of the Mays Business School Guidelines:
  - **Tenured/Tenure-Track Faculty: Professor** (evaluated on Research & Publication, Teaching, and Service; expected to demonstrate leadership and *excellence* in at least one area)
  - **Tenured/Tenure-Track Faculty: Associate Professor** (evaluated on Research & Publication, Teaching, and Service; expected to demonstrate *effectiveness* in all three, with *excellence* in research/publication or teaching)
  - **Tenured/Tenure-Track Faculty: Assistant Professor** (evaluated on Research & Publication, Teaching, and Service; focus is progress toward tenure; *effectiveness* in teaching and *excellence* in research expected)
  - **APT Faculty: Lecturer / Senior Lecturer / Principal Lecturer** (evaluated primarily on Teaching, with secondary consideration of Service; Research is NOT evaluated and its absence must not be noted negatively)
  - **APT Faculty: Clinical Assistant / Associate / Professor** (evaluated on Teaching and Service; may satisfy service expectations through research publications with Department Head approval)
  - **APT Faculty: Professor of Practice (Assistant / Associate / Full)** (evaluated on Teaching and Service; individuals without terminal degrees who had distinguished private-sector careers)
  - **Department Head** (evaluated on departmental leadership, faculty development, strategic direction, budget stewardship, plus their own continued research if applicable)
  - **Associate Dean / Other Administrative Leadership** (evaluated on cross-functional impact, strategic initiatives, institutional leadership, program building)
- Text input: Recipient's department (pre-filled from the writer's department, editable)
- Optional text input: Dean or supervisor name to CC on the accompanying email (pre-filled with "Dean Sharp", editable)

- **Performance Ratings** (per the Mays Business School Guidelines, Section 6.4). The department head assigns a separate rating for EACH applicable performance area. The official Mays four-level scale is used:

  **For Tenured/Tenure-Track Faculty and Department Heads, three separate dropdowns:**
  - **Teaching rating**: Excellent / Effective / Needs Improvement / Unsatisfactory
  - **Research and Publication rating**: Excellent / Effective / Needs Improvement / Unsatisfactory
  - **Service rating**: Excellent / Effective / Needs Improvement / Unsatisfactory

  **For APT Faculty (Lecturers), two dropdowns:**
  - **Teaching rating**: Excellent / Effective / Needs Improvement / Unsatisfactory
  - **Service rating** (if applicable): Excellent / Effective / Needs Improvement / Unsatisfactory

  **For APT Faculty (Clinical, Professor of Practice), two or three dropdowns:**
  - **Teaching rating**: Excellent / Effective / Needs Improvement / Unsatisfactory
  - **Service rating**: Excellent / Effective / Needs Improvement / Unsatisfactory
  - **Research and Publication rating** (optional, only if they have research expectations): Excellent / Effective / Needs Improvement / Unsatisfactory

  **Overall rating dropdown** (auto-suggested based on the per-area ratings, but editable by the department head):
  - Excellent
  - Effective
  - Needs Improvement
  - Unsatisfactory

  *Rating definitions (from Mays Guidelines Section 3):*
  - *Excellent*: a high level of performance that meets and exceeds norms and expectations, reflected by substantive indicators of excellence
  - *Effective*: performance that meets norms and expectations, reflected by substantive indicators of effective performance
  - *Needs Improvement*: performance that falls below norms and expectations of effective performance
  - *Unsatisfactory*: performance that falls below norms and expectations of excellent, effective, and needs improvement performance

**Step 2: Upload Documents and Add Notes**

- File upload area (drag and drop) for the recipient's self-evaluation (.docx or .pdf)
- File upload area for the recipient's CV (.docx or .pdf)
- Optional: additional supporting documents

- **Free-text area: "Your observations and notes"** (a large text box where the writer can type rough notes, bullet points, or thoughts they want reflected in the letter). Examples of what they might type:
  - "She was amazing in the classroom this year, students loved her"
  - "He struggled with the committee work but his research was top-notch"
  - "I want to emphasize the mentoring she did with junior faculty"
  - "Growth area: needs to be more proactive about grant submissions"
  - "Goals we discussed: improve PhD placements, launch new certificate program, write 2 papers"

  These notes will be passed to the Writing Agent as additional context alongside the research brief. The prompt should instruct the AI to weave these observations naturally into the "My Observations and Our Discussion" section and to use the stated goals in the "Your Plan for the Upcoming Year" section.

**Step 3: Generate (three-phase pipeline)**

When the user clicks "Generate Letter," the app runs three sequential AI phases. Show progress for each phase with animated maroon progress indicators.

**Phase 1 -- Research**: Extract every factual claim, number, accomplishment, and goal from the uploaded documents. Display the research brief to the user for review. The user can edit or add notes before proceeding.

**Phase 2 -- Draft Letter**: Generate the evaluation letter using the research brief + the writer's notes. Display the full draft letter in a rich text preview. The user can edit inline before proceeding.

**Phase 3 -- Verification**: Check every factual claim against the source documents. Check for AI-sounding language. Display a verification report showing what was confirmed, flagged, or needs revision. Auto-fix any flagged AI language patterns.

**Step 4: Download**
- Download button for the final .docx letter (formatted with proper headers, memorandum format, signature block)
- Download button for the accompanying email (.docx)
- Option to regenerate or revise

### Batch Upload Mode (Alternative Workflow)

In addition to the single-person workflow above, the Admin Tools tab offers a **Batch Mode** toggle at the top of the page. When enabled, the workflow changes:

**Batch Step 1: Upload All Materials**

- The department head uploads all self-evaluations and CVs at once. The app accepts:
  - **Drag-and-drop of multiple files**: The app attempts to auto-match files to people based on filenames (e.g., "Jane Smith - CV.pdf" and "Jane Smith - Self Evaluation.docx" get paired together). The department head can review and correct the matching.
  - **A ZIP file**: containing subfolders per person (each subfolder contains that person's CV and self-evaluation)
  - **Individual file uploads**: the department head manually assigns each file to a person

- **Optional: Batch notes upload.** The department head can provide their notes for all people in one of two formats:
  - **A Word document** with clear section headers per person (e.g., "## Jane Smith" followed by notes, then "## John Doe" followed by notes). The app parses the document and associates notes with each person.
  - **A spreadsheet (.xlsx)** with columns: Name, Role Category, Teaching Rating, Research Rating, Service Rating, Overall Rating, Notes. The app reads this and pre-fills the setup fields for each person.

**Batch Step 2: Review Queue**

- The app displays a **queue panel** showing all people detected from the uploaded files, with status indicators:
  - Gray: Not started
  - Yellow: In progress (research brief generated, awaiting review)
  - Green: Complete (letter generated and verified)
  - Red: Needs attention (verification flagged issues)

- The department head clicks on a person to enter their individual workflow (setup, review research brief, review draft, download). When done, they return to the queue.

- For each person, if notes were provided via batch upload, the notes text area is pre-filled. The department head can edit before generating.

- **Auto-fill from spreadsheet**: If the department head uploaded a spreadsheet with ratings and role categories, those fields are pre-filled for each person. The department head reviews and confirms before generating.

**Batch Step 3: Generate All / Generate One-by-One**

- The department head can either:
  - **Step through one at a time**: Click each person, review their research brief, adjust notes, generate and review each letter individually. This is the recommended approach for quality.
  - **Generate all remaining**: Click a "Generate All" button that runs the three-phase pipeline for every person who hasn't been processed yet. The department head reviews all letters afterward. This is faster but may require more revision.

**Batch Step 4: Download All**

- A "Download All Letters" button packages all completed letters as a ZIP file with individual .docx files named per the naming convention.
- A separate "Download All Emails" button generates the email file.
- The department head can also download individual letters from the queue panel.

### Tab 3: About
Brief page about the Mays Method Lab leadership and mission. Dark theme, consistent with the rest of the site.

---

## The AI Pipeline: Detailed Prompts

### CRITICAL: Human-Sounding Writing Rules

Every piece of prose the AI generates MUST follow these rules. Embed these rules in every writing prompt. These are the difference between a letter that sounds like a human leader wrote it and one that sounds like ChatGPT.

#### Banned Words (never use these)
**Adjectives**: robust (non-statistical), comprehensive, nuanced, multifaceted, intricate, innovative, cutting-edge, seamless, pivotal, crucial, vital, vibrant, compelling, profound, notable, commendable, meticulous, versatile, holistic

**Verbs**: delve, harness, leverage, underscore, foster, enhance, streamline, optimize, embark, navigate (except in literal contexts), unpack, unravel, showcase, garner, spearhead, bolster, catalyze, revolutionize, transcend

**Nouns**: landscape (metaphorical), realm, ecosystem (non-biological), tapestry, trajectory (non-physical), paradigm, synergy, nexus, interplay, cornerstone, bedrock, underpinning, testament, beacon, hallmark, game-changer

**Adverbs**: fundamentally, significantly (without data), remarkably, notably, importantly, crucially, essentially, ultimately, inherently

#### Banned Phrases and Openers
Never start a sentence with: "In today's...", "In an era of...", "In the ever-evolving...", "As [X] continues to evolve...", "It is important to note that...", "It is worth noting that...", "Moreover,", "Furthermore,", "Additionally,", "Indeed,", "Notably,", "Importantly,", "Taken together,"

Never use: "In other words,...", "the fact that", "In order to", "Due to the fact that", "It is widely recognized that..."

#### Structural Rules
- No em-dashes or en-dashes. Use commas, semicolons, colons, or split into two sentences. This is the single most recognizable AI writing pattern.
- Paragraphs should vary in length naturally, not be artificially balanced
- Do not default to three items in every list; use however many actually exist
- Do not write every paragraph as: topic sentence, three points, summary
- No triple parallel structures ("AI changes how firms compete, how firms organize, and how firms learn")
- Maximum one "While X, Y" opener per page

#### Sentence-Level Rules
- Do not end sentences with "-ing" phrases that summarize significance ("...highlighting the importance of governance")
- Prefer verbs over nominalizations ("The system improved outcomes" not "The implementation led to an improvement")
- Use "is" freely; do not replace with "serves as," "stands as," "represents," "constitutes"
- Limit "not just X, but Y" to once per section
- Repeat the right word rather than cycling synonyms
- Match confidence to evidence; do not hedge when the data are strong
- Research does not "reveal" or "underscore" things; researchers do

#### Tonal Rules
- Take positions; do not present false balance
- Show epistemic variation (certain about some things, uncertain about others)
- Do not end with vague optimism about "the field continuing to evolve"
- Leave appropriate loose ends; not everything resolves neatly

### Phase 1 Prompt: Research Agent

```
You are the Research Agent for an evaluation letter. Your job is to read the uploaded documents and produce a comprehensive, factual research brief. You are the foundation of the process: if you miss something, it won't appear in the letter. If you invent something, the letter will contain a fabrication.

Read ALL uploaded documents carefully. Produce a structured research brief with the following sections:

## Basic Information
- Full Name
- Title/Role
- Department
- Role Category (tenured-faculty, apt-faculty, staff, department-head, associate-dean, administrative)

## Research and Scholarly Accomplishments
Every publication, paper under review, grant, presentation, award, or scholarly activity. Include exact journal names, co-authors, status (published, accepted, under review, R&R), citation metrics, conference names, grant amounts. For staff or APT faculty without research expectations, note "N/A" or list any scholarly contributions if present.

## Teaching and Student-Facing Accomplishments
Courses taught (with numbers), evaluations/scores, curriculum development, student mentoring, PhD placements, teaching awards, new course development, advising load.

## Service and Administrative Accomplishments
Committees, editorial roles, department/college/university service, professional organization leadership, administrative achievements (hiring, budget, program launches), event management, process improvements.

## Operational and Team Accomplishments (for staff roles)
Team management, process improvements, event coordination, student support, professional development, cross-department collaboration.

## Areas Where Goals Were Not Fully Met
Quote or closely paraphrase what the person themselves said about shortcomings. Do not editorialize. If they didn't mention any, note that explicitly.

## Goals for the Upcoming Year
List every goal they stated. Use their own language as closely as possible.

## Key Themes and Patterns
Note 2-3 overarching themes across their materials.

## Raw Numbers and Facts
A bullet list of every specific number, date, name, or verifiable fact. This is the verification agent's primary reference.

RULES:
1. NEVER invent. If the CV mentions a publication but gives no journal name, write "publication (journal not specified)." Do not guess.
2. NEVER infer accomplishments. If someone lists a committee membership but doesn't describe what they did, just list the membership.
3. PRESERVE specificity. "grew revenue by 23%" not "significantly grew revenue."
4. Read the CV carefully for context the self-evaluation may miss. Flag anything noted in CV but not in self-evaluation.
5. Note the tone of their self-evaluation (confident, modest, defensive about certain areas).
```

### Phase 2 Prompt: Writing Agent

```
You are writing a formal annual performance evaluation letter. You are writing on behalf of {writer_name}, {writer_title} at {institution}.

The letter evaluates {recipient_name}, {recipient_title} for the year {eval_year}.

The recipient's role category is: {role_category}.

Performance ratings for this evaluation (per Mays Business School Guidelines, Section 6.4):
- Teaching: {teaching_rating}
- Research and Publication: {research_rating} (N/A if role category does not require research evaluation)
- Service: {service_rating}
- Overall: {overall_rating}

Use the research brief below to write the letter. Also incorporate the writer's personal observations and notes (provided separately below the research brief).

Follow this exact structure:

1. DATE LINE: "{month} {year}" (current month and year)

2. MEMORANDUM header

3. TO/FROM/SUBJECT block:
   TO: {recipient_name}
       {recipient_title}
   FROM: {writer_name}
         {writer_title}, {institution}
   SUBJECT: {eval_year} Performance Evaluation

4. SALUTATION: "Dear {first_name},"

5. OPENING PARAGRAPH: Thank them for serving in their role. Adapt the opening based on role category:
   - For faculty and department heads: reference their "Professional Activity and Accomplishment Report (January 1 to December 31, {eval_year})."
   - For staff: reference their "annual performance review" or "self-evaluation."
   - For APT faculty: acknowledge their teaching-focused appointment naturally.
   Note this is a follow-up to the review and the annual performance review meeting.

6. SUMMARY OF MAJOR ACCOMPLISHMENTS (heading, bold): 3-5 paragraphs of flowing narrative prose. NO bullet points. Each paragraph focuses on a coherent area. Weave specific accomplishments into a story about why they matter. Every praise statement must be tied to a specific accomplishment with names and numbers.

7. MY OBSERVATIONS AND OUR DISCUSSION (heading, bold): 2-3 paragraphs.
   - Paragraph 1: Personal observations about their performance. What makes their approach distinctive. IMPORTANT: Use the writer's personal notes heavily here. These notes reflect what the writer actually thinks and said in their meeting.
   - Paragraph 2: Growth area, framed constructively as a natural next step. Acknowledge the strength first, then suggest evolution.
   - Paragraph 3 (optional): Additional nuance or context.

8. YOUR PLAN FOR THE UPCOMING YEAR (heading, bold):
   - Opening sentence connecting their goals to the institutional moment
   - 3-5 bullet points of specific goals from the self-evaluation and the writer's notes about discussed goals, each 1-2 sentences
   - Closing sentence affirming confidence in their direction

9. SUMMARY (heading, bold): 2-3 sentences.
   - Use their first name. Make a summary statement.
   - Optional: an inspirational quote that resonates with their contributions (only if it feels natural, and verify the attribution is correct).
   - State the per-area ratings explicitly: "My evaluation of your performance is as follows: Teaching: {teaching_rating}; Research and Publication: {research_rating}; Service: {service_rating}. Overall, my evaluation is that you have demonstrated {overall_rating} performance."
   - For APT faculty without research expectations, omit the Research and Publication line entirely.
   - "Please return a signed copy of this annual performance review for our personnel files. Thank you."

10. SIGNATURE BLOCK: A line of underscores, then "Signature" and "Date"

CALIBRATE TONE TO RATINGS (using the official Mays four-level scale):

The letter must address each performance area (Teaching, Research & Publication, Service) with a tone calibrated to that area's individual rating. The overall tone of the letter reflects the overall rating.

- **Excellent**: "nothing short of remarkable," "this was a year that set a new standard," "I do not use the word excellent lightly." The section covering this area is expansive and celebratory. Growth areas are framed as "taking your already excellent work to the next level." Per Mays Guidelines, this means performance that meets AND exceeds norms and expectations.
- **Effective**: "a strong and productive year," "consistent, valuable contributions," "you met the expectations for your role and in several areas exceeded them." Warm and substantive. Growth areas framed as natural next steps and opportunities. Per Mays Guidelines, this means performance that meets norms and expectations.
- **Needs Improvement**: Handle with care but be direct. Acknowledge strengths first, then be specific about what needs to change. Growth areas are framed as clear priorities with specific expectations and timelines. Note that per Mays Guidelines Section 6.6.2, the department head and faculty member must develop a plan for near-term improvement. The letter should reference this plan.
- **Unsatisfactory**: Handle with extra care. Be specific about what needs to change. Be honest but respectful. Growth areas are framed as requirements, not suggestions. Per Mays Guidelines Section 6.6.1, this rating requires a written improvement plan, and copies go to the Dean and Senior Associate Dean.

IMPORTANT: When a faculty member receives different ratings in different areas (e.g., Excellent in Research but Needs Improvement in Service), the letter must reflect both realities authentically. Do not let the praise in one area dilute the directness needed in another, and do not let criticism in one area overshadow genuine accomplishment in another.

CRITICAL WRITING RULES:
[Insert the complete banned words, phrases, structural rules, and sentence-level rules from above]

ADAPT TO ROLE CATEGORY (per Mays Business School Guidelines, Sections 2 and 6):

- **Tenured/Tenure-Track Faculty: Professor**: Evaluate across all three areas (Research & Publication, Teaching, Service). Professors should demonstrate leadership in pursuing *excellence* and gain national and international prominence. Emphasize continued productivity, mentoring of junior faculty, editorial leadership, PhD student development, and service contributions. Professors are expected to show *excellence* in one or more of the three performance areas.

- **Tenured/Tenure-Track Faculty: Associate Professor**: Evaluate across all three areas. The School expects *effectiveness* in all three areas, with *excellence* in either research/publication or teaching. Emphasize progress since tenure, growth in service contributions, and whether they are building toward promotion to Professor. Research and publication commonly carry the heaviest weight.

- **Tenured/Tenure-Track Faculty: Assistant Professor**: Evaluate across all three areas. Focus is progress toward promotion to Associate Professor with tenure. Must demonstrate *effectiveness* in teaching and *excellence* in research and publication. Service focus is limited to departmental and college academic needs. Be attentive to the tenure clock. The annual review serves as an assessment of progress toward a positive tenure decision.

- **APT Faculty: Lecturer / Senior Lecturer / Principal Lecturer**: Evaluate primarily on Teaching, with secondary consideration of Service. CRITICAL: Do NOT evaluate on Research and Publication. Do NOT reference the absence of research activity negatively. Per Mays Guidelines Section 6.2, a faculty member serving at the rank of Lecturer will not be evaluated on research, nor will the lack of such activities be viewed as a negative factor. The School expects APT faculty to achieve *excellence* in teaching. For Lecturers with exceptional service records and Department Head approval, *effectiveness* in teaching is sufficient for a period, though *excellence* remains the long-term objective.

- **APT Faculty: Clinical Assistant / Associate / Professor**: Evaluate on Teaching and Service. These faculty hold terminal degrees and contribute primarily to teaching while fulfilling service expectations in the context of their professional expertise. With Department Head approval, clinical faculty may satisfy service expectations through research publications in respected academic journals. If they do publish, note it positively, but do not penalize its absence unless it was part of their agreed-upon expectations.

- **APT Faculty: Professor of Practice (Assistant / Associate / Full)**: Evaluate on Teaching and Service. These faculty do not hold terminal degrees but have distinguished private-sector careers. They concentrate on either teaching or service. With Department Head approval, they may satisfy service expectations through additional teaching or intellectual contributions consistent with AACSB's scholarly practitioner classification.

- **Department Head**: Evaluate on departmental leadership, faculty development and hiring, strategic direction, departmental culture, enrollment and program management, budget stewardship, external relations, and their own continued research (if applicable). Department Heads seeking to reduce performance expectations to zero in a category for a specified period consult with the Dean and Senior Associate Dean.

- **Associate Dean / Other Administrative Leadership**: Evaluate on cross-functional impact, strategic initiatives, institutional leadership, program building, and the scope of their portfolio. Associate Deans seeking to reduce performance expectations to zero in a category consult with the Dean.

ADDITIONAL VOICE GUIDELINES:
- Write like a senior academic leader who genuinely cares about the person's growth
- Reference specific conversations where possible (use the writer's notes for this)
- Connect individual contributions to the bigger institutional picture
- Be warm and personal but maintain collegial authority
- Vary sentence length: mix short punchy sentences with longer analytical ones
- If three sentences in a row start with the same word (especially "Your"), rewrite
- Use "I" when stating observations and "we" when speaking institutionally
- Frame growth areas as logical next steps, not deficiencies

RESEARCH BRIEF:
{research_brief}

WRITER'S PERSONAL OBSERVATIONS AND NOTES:
{writer_notes}
```

### Phase 3 Prompt: Verification Agent

```
You are the verification agent. Check every factual claim in the letter against the source documents. Also check for AI-sounding language.

STEP 1: Go through the letter sentence by sentence. Identify every verifiable claim: numbers, names, dates, titles, accomplishments, awards, course names.

STEP 2: For each claim, find the corresponding passage in the source documents. Classify as:
- CONFIRMED: matches the source exactly or with minor rephrasing
- EMBELLISHED: source says something related but the letter adds unsupported detail
- FABRICATED: no corresponding information in any source document
- INFERRED: reasonable conclusion but not explicitly stated

STEP 3: Check for AI language patterns:
- Em-dashes or en-dashes: flag every instance
- Any word from the banned words list
- Three or more consecutive sentences starting with "Your" or "You"
- "From X to Y, from A to B" parallel constructions
- Generic praise without specific backing
- Sentences all approximately the same length (5+ in a row)
- Participial phrases at sentence ends summarizing significance ("...highlighting the importance of")

STEP 4: If any FABRICATED claims or AI language issues are found, rewrite those specific sentences to fix the problems. Return both the verification report and the corrected text.

LETTER TEXT:
{letter_text}

SOURCE DOCUMENTS:
{source_documents}
```

### Accompanying Email Prompt

```
Write a brief, warm email to accompany the evaluation letter. This email is from {writer_name} to {recipient_name}, CC'd to {cc_name}.

Structure:
1. Thank them for meeting, for their self-evaluation, and for the conversation. Make it personal.
2. Tell them you've written a letter capturing the discussion and their goals.
3. Mention 2-3 specific highlights from the letter (with numbers and program names).
4. A warm, personal closing about what it means to work with them.
5. "I am copying {cc_name}. The formal letter will be sent for your signature and personnel file."
6. Sign-off: "Warm regards, {writer_first_name}"

Rules:
- Same banned words and punctuation rules as the letter
- Approximately 100-150 words in the body
- The tone should make the recipient feel valued, not evaluated
- No rating language (don't mention "excellent" or "strong" performance)

LETTER CONTENT (for reference):
{letter_content}
```

---

## Document Generation (.docx)

Use the `docx` npm package to generate the final Word document. Format:

- Page size: US Letter (8.5" x 11"), 1" margins
- Font: 11pt Calibri throughout
- Section headings: Bold, 11pt, same font
- Body text: single-spaced within paragraphs, blank line between paragraphs
- Header: Include the writer's institution name/logo on the first page only (make this configurable)
- Footer: Page number on pages 2+ only
- Signature block: horizontal line of underscores, then "Signature" left-aligned and "Date" right-aligned
- Bullet points in the goals section: proper Word list formatting, not Unicode bullet characters

---

## File Structure

```
mays-method-lab/
  src/
    app/
      page.tsx                    # Home tab (cinematic landing page)
      admin/
        page.tsx                  # Admin tools (letter writer)
        layout.tsx                # Auth wrapper
      about/
        page.tsx                  # About tab
      api/
        auth/
          route.ts                # Auth endpoint (placeholder for TAMU SSO)
        research/
          route.ts                # Phase 1 API
        draft/
          route.ts                # Phase 2 API
        verify/
          route.ts                # Phase 3 API
        email/
          route.ts                # Email generation API
        download/
          route.ts                # .docx generation and download
      layout.tsx                  # Root layout with header/nav
    components/
      Header.tsx                  # Dark header with nav tabs
      Footer.tsx                  # Mays/TAMU dark footer
      HeroSection.tsx             # Full-screen hero with video background
      ScrollReveal.tsx            # IntersectionObserver wrapper component
      FileUpload.tsx              # Drag-and-drop upload component
      WriterSelector.tsx          # Dropdown of hardcoded department heads
      WriterNotes.tsx             # Free-text area for writer observations
      ResearchBrief.tsx           # Editable research brief display
      LetterPreview.tsx           # Rich text letter preview
      VerificationReport.tsx      # Verification results display
      ProgressTracker.tsx         # Three-phase animated progress indicator
      LoginForm.tsx               # Auth form (password now, SSO later)
    lib/
      claude.ts                   # Anthropic API client
      prompts.ts                  # All prompt templates
      writers.ts                  # Hardcoded list of department heads/leaders
      docx-generator.ts           # .docx file generation
      extract-text.ts             # .docx and .pdf text extraction
      writing-rules.ts            # Banned words, patterns, validation
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

1. **Streaming**: Use Claude's streaming API for Phase 2 (letter drafting) so the user sees the letter being written in real-time. This is important for the experience and demonstrates the AI capability.

2. **Error handling**: If any phase fails, show a clear error message and let the user retry that phase without losing previous work.

3. **Session state**: Keep all state in React (useState/useReducer). The research brief, draft letter, and verification report all live in client state during the session. No database needed for v1.

4. **File size limits**: Cap uploads at 10MB per file. Show a clear error if exceeded.

5. **Rate limiting**: Add basic rate limiting on the API routes (e.g., max 10 requests per minute per session).

6. **The writing rules are the secret sauce**: The banned words list, the structural rules, and the verification pipeline are what make this tool produce genuinely human-sounding output. Embed these rules deeply in every prompt. Do not skip or abbreviate them.

7. **Editable intermediate outputs**: The user MUST be able to edit the research brief before it goes to Phase 2, and edit the draft letter before it goes to Phase 3. This is not optional. Academic leaders need to add their own observations and correct any misreadings.

8. **Writer's notes are critical input**: The free-text area where the writer types rough observations, bullet points, and discussed goals is a first-class input. These notes should be passed to Phase 2 as a separate section in the prompt and should heavily influence the "My Observations" and "Your Plan" sections. Without them, the letter reads like a summary of documents. With them, it reads like a letter written by someone who knows the person.

9. **Quote verification**: If the letter includes an inspirational quote, the verification agent must check the attribution. Misattributed quotes are embarrassing. If the attribution cannot be verified with high confidence, remove the quote.

10. **Texas A&M naming conventions**: The app should enforce these in generated text:
    - "Texas A&M University" on first reference, "Texas A&M" thereafter
    - "Mays Business School" on first reference, "Mays" thereafter
    - Serial comma only when needed for clarity (AP style)
    - Titles lowercase after name ("Nate Sharp, dean of Mays Business School")
    - Titles capitalized before name ("Dean Nate Sharp")

11. **SSO readiness**: Structure the auth layer so it can be replaced with TAMU CAS SSO. The current password gate is a placeholder. When SSO is implemented, the writer dropdown can be auto-populated based on the authenticated user's NetID and role.

12. **Hero video fallback**: If no `.mp4` file is provided initially, implement a CSS-only animated background as a fallback. A slowly morphing gradient in dark maroon tones, or a subtle CSS particle animation, will hold the space until a proper video is produced.

---

## What to Build First (MVP)

1. Set up the Next.js project with the dark TAMU design system (colors, fonts, animations)
2. Build the Home page with hero section (video or CSS fallback), mission, vision, and leadership
3. Build the Login page and auth middleware (password for now, SSO-ready)
4. Build the Admin page with the four-step workflow UI (Setup with writer dropdown, Upload with notes area, Generate, Download)
5. Implement text extraction from .docx and .pdf uploads
6. Implement the three Claude API calls (research, draft with writer notes, verify) with streaming for Phase 2
7. Implement .docx generation for the final letter
8. Implement the email generation step
9. Test the full pipeline end-to-end
10. Deploy to Render

---

## Testing the Pipeline

Before deploying, test with a sample self-evaluation and CV. Verify:
- The research brief captures every fact from the source documents
- The letter follows the exact 10-section structure
- The writer's rough notes/bullets appear naturally in the Observations and Goals sections
- No banned words appear anywhere in the output
- No em-dashes or en-dashes appear
- No three consecutive sentences start with "Your"
- The verification report correctly identifies any fabricated claims
- The .docx downloads correctly with proper formatting
- The email is warm, specific, and under 150 words
- The performance rating calibrates the tone correctly (test with both "excellent" and "satisfactory" to verify tonal difference)
