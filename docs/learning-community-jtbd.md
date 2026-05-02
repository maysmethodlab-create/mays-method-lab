# AI Learning Community, JTBD grounding
*Drafted 2026-05-02. For Hari's review. ~2,900 words.*

## Bottom line

1. **Keep the role toggle, but earn it.** Faculty and staff jobs diverge enough that a single shared landing page would dilute both. Two role-landed views is right. The fix is not the toggle. It is what each side sees first.
2. **Adopt a five-bucket taxonomy, but not the one you proposed.** Recommendation is **Option C** below. Faculty: Research, Teaching, Writing, Learning AI. Staff: Programs, Faculty support, Advising, Writing, Learning AI. "Communication" disappears as a top-level bucket and folds into Writing. "General AI learning" becomes the fifth bucket on both sides ("Learning AI"), with the same content. The legacy `/resources` page (TAMU-provided tools) becomes a permanent right-rail anchor on the role-landed grid, not a bucket.
3. **The four-tier ladder (USE NOW, COPY, BUILD, GO DEEPER) is correct but front-loaded wrong.** Visit one users do not read four tiers. Show only USE NOW above the fold and lazy-reveal the rest. Borrow Apple's "See all" pattern.
4. **Add one row that is not a bucket: "What others at Mays did this month."** This is the Netflix move. It rewards visit five and visit twenty without overwhelming visit one. Even at n=150 it works because it is curated, not algorithmic.
5. **Drop the "compliance status" badge from card bodies.** Move to a single trust banner at the top of `/tools`. Badges on cards add noise and scare visit-one users.

---

## Personas

### Faculty 1: Sara, research-heavy associate professor
*Composite, modeled on the Marketing tenured associate cohort.*

Mid-career, two papers under R&R, prepping a JM submission, teaches one MBA elective per year, sits on the doc committee. Reads on her phone in the elevator and at swim practice.

Jobs where AI helps:
- Synthesize 15 papers into a position-mapped table for a lit review
- Polish a methods paragraph a co-author flagged as muddy
- Generate three rebuttal angles for a tough R2 reviewer comment
- Draft a recommendation letter for a doctoral student going on the market
- Sanity-check a Python script that loads experimental data

Visit 1: scans for "Research." Wants one working tool, fast. If the bucket has more than three items above the fold, she taps back. If TAMU AI Chat is the first card, she clicks once and never returns.

Visit 5: she has a workflow. Comes back for prompts she half-remembers. Wants a search box, or a "Last used" surface. Current grid is fine if **COPY-A-PROMPT is one tap deep, not three**.

Visit 20: power user. Wants to subscribe to "new prompts in Research" and to nominate one. The page has no surface for either.

Where she bounces: a wall of four tiers per bucket on a phone. If USE NOW does not load on first paint, she leaves.

### Faculty 2: Marco, teaching-heavy clinical professor
*Composite, modeled on apt-clinical entries across departments.*

Four sections a semester, two preps. No active research. Heavy email, gradebook nights. Course design in August and December. Mid-semester his AI need is "make this email three lines shorter and warmer."

Jobs:
- Generate a rubric for a new case-discussion assignment
- Build practice exam questions from a lecture deck
- Decode a student's confused email into the actual question
- Draft an absence-policy reply that does not sound robotic
- Summarize peer-evaluation comments into one paragraph per team

Visit 1: he wants Teaching. His default AI tool is whatever ChatGPT tab is open. The LC must offer something ChatGPT does not. The Lab apps (`/admin/evaluation-letters`) and TAMU AI Chat compliance are the differentiators. Lead with those.

Visit 5: start-of-semester run. Wants to grab three prompts as a bundle, not click each card. No "save these five" gesture today.

Visit 20: he is teaching a colleague. Sends them a deep link to a single prompt. Today prompt URLs live on `maysai.vercel.app` and do not read as credible.

Where he bounces: anything labeled "Build your own (45 to 90 min)" is invisible to him. Move BUILD last.

### Faculty 3: Linda, department head
*Composite, modeled on the five `roleCategoryHint: department-head` entries.*

Runs a department of forty faculty. Writes more letters in a year than papers. Annual evaluations, P&T outside letters, hiring memos, donor notes. Not technical. Lives in Outlook.

Jobs:
- Draft an annual evaluation letter from a self-evaluation packet (the Lab has this app)
- Write a donor update from raw quarterly numbers
- Summarize a faculty meeting into action items by Friday
- Help a junior colleague respond to a tough reviewer
- Decode a budget document the Business Administrator sent

Visit 1: here because Hari pointed her at the Evaluation Letter Writer. Does not browse buckets. Wants the app, fast. The role grid is friction.

Visit 5: she types `/admin/evaluation-letters` directly. Has never seen the Research bucket and never will.

Visit 20: she emails the staff list saying "use the Lab's letter writer," with the LC page as the URL. **It must look credible to a person who has not seen it.** Today it does, because she sees Writing immediately.

Where she bounces: the role toggle. She is faculty but her work is mostly writing and running her department. The site does not handle her cleanly.

### Staff 1: Ashley, program coordinator
*Composite, modeled on the 18 Program Coordinator I/II entries (Ashley Crocker, Sarah Warwick, Graham Welch, Jana Sprayberry, Maria Ponce, Barbara Musgrove, Jose Quiros, Brooke Diviak, Alexis Broussard).*

Runs the operational layer of one degree program: registration sheet, prospect funnel, orientation, LinkedIn group. Forty percent email, thirty percent forms, twenty percent events, ten percent fires. Does not code. Excel daily, Power Automate occasionally.

Jobs:
- Draft an announcement about a registration deadline
- Summarize a forty-message Outlook thread for her director
- Turn a meeting transcript into action items with owners and dates
- Clean a 200-row registration CSV (de-dup emails, flag bad phones)
- Write the recruiter-outreach email she sends every February

Visit 1: lands on Staff, looks for "Programs." The current "Running programs" label works. Above the fold she needs **one** thing: TAMU AI Chat. The page does this right.

Visit 5: back for the announcement-writer prompt. Wants it on her phone, copy-pasteable, in five seconds. The cross-domain `maysai.vercel.app` link is slow and does not feel like Mays.

Visit 20: she built a Power Automate flow for orientation RSVPs. Wants to share it with the other coordinators. The site has no surface for "what Mays staff built." Biggest current miss.

Where she bounces: any tile labeled "agent" with a 75-min tag. She does not have 75 minutes. BUILD is dead to her unless reframed as "Pair with a student to build this."

### Staff 2: Diana, executive assistant to a department head
*Composite, modeled on Diana Kruse (Accounting), Barbara Holl (Management), Spring Basey (Marketing), and the Senior Administrative Coordinator entries.*

Calendar, travel, reimbursements, hiring logistics, ghost-drafted memos. Highest-impact AI user in the building because every minute saved compounds across five faculty.

Jobs:
- Summarize a three-page self-evaluation into a one-paragraph briefing
- Draft a routine "thanks for your visit" note in the boss's voice
- Pull names and dates out of a PDF itinerary into a calendar entry
- Reformat a faculty CV into the school's promotion-packet template
- Triage Outlook: which of these 47 emails actually need the boss

Visit 1: lands because someone pointed her at the evaluation-letter app. Wants a "search by task" surface. The grid forces her to read five headers and decide which fits "summarize a self-evaluation." A visit-one tax.

Visit 5: a small set of weekly prompts. Wants a "starred" tier. No notion of personal state today.

Visit 20: becomes a teacher. Newer EAs ask how she works. Today she emails screenshots. The site should let her say "click these five things in order."

Where she bounces: BUILD. Same as Ashley. EAs use agents, do not build them.

### Staff 3: Jen, degree-program director
*Composite, modeled on the ten Director / Assistant Director / Program Director entries (Jennifer Griffin, Camilla Rhome, Misty Page, Kristi Mora, Veronica Stilley, Casey Kyllonen, Kourtney Gruner, Valerie McLaughlin, Bulkeley Banks, Leah Herrington).*

Runs a master's program end to end: admissions, curriculum, employer relations, alumni, budget. One or two coordinators report to her. Three monthly committees. Writes the program newsletter.

Jobs:
- Write the monthly newsletter from a pile of program updates
- Draft a curriculum-change memo to the dean's office
- Build a 2026 strategy doc from four advisory-board meetings
- Compare her program's enrollment trend against three years
- Coach a coordinator on how to handle a difficult parent email

Visit 1: five buckets, none say "Director" but Programs is the right home. The shared Writing bucket also fits some of her work.

Visit 5: returns when she has a writing task in her boss's voice. The Evaluation Letter Writer caught her eye. Wants a "newsletter writer" version.

Visit 20: she is the staff persona who would actually build a custom agent. Has a recurring enrollment-data question. Might do a 45-min tutorial. BUILD is for her, but she will not find it without a nudge.

Where she bounces: she does not. She is the staff power user. Optimize for her at visit 20.

---

## Navigation patterns audit

I am drawing on training-data knowledge of how Apple, Netflix, and Amazon work in 2026. Did not WebFetch. The patterns are stable enough across years that I am confident in them. Flagged below where I am less certain.

### Apple

Apple's homepage is roughly seven hero rectangles, each one a product launch with a photograph and three words of copy. No nav bar that lists every product. Assumes you came for one thing.

1. **Above the fold is one rectangle, not seven.** Hari's page shows four bucket cards. Cut to one hero ("If you are new, start here") and put the four cards below it.
2. **"See all" defers complexity.** Apple shows three accessories plus "See all." Apply to COPY-A-PROMPT: show three, link "See all 11 prompts."
3. **Every card has a photograph.** Does not translate cleanly. The closest analog: every BUILD tutorial gets one screenshot of the finished tool. Cheap. Big perceived-quality lift.

Internal-tool caveat: Apple's restraint works because users come with a goal. Some Mays users do not. The bucket grid must still support browse. Use "See all" inside buckets, not at the top.

### Netflix

A stack of horizontal rows: Trending, Continue Watching, Because You Liked X, New Releases. Each row is a curatorial point of view. Users scan down rows, not deep into any one row.

1. **Row-based browsing.** A bucket is a row. Hari's grid is this already. Keep it.
2. **"Because you liked X" as contextual recommendation.** Hand-curated works at small scale. After Sara reads Research, show "Faculty who used Research also looked at Writing." Cheap to implement, rewards visit 5.
3. **"Top 10 in your school" row.** Netflix's "Top 10 in the US" is social proof that needs huge n. At Mays we do it editorially: **"What 5 staff members built this month"**, hand-picked, refreshed monthly. Most important recommendation in this doc.

Caveat: deep personalization (taste graph, auto-trailers) needs a data layer we lack. Skip.

### Amazon

A "you, here, now" layout: Recently viewed, Buy again, Your orders. Heavily personalized.

1. **"Recently viewed."** A cookie-stored array of last-three-clicked items in the page header solves visit 5 for everyone.
2. **"Customers who bought X also bought Y."** Same idea as Netflix's "Because you liked X." Editorial version feasible. Algorithmic version is not.
3. **Dense category mega-menu.** The move Hari should *not* copy. It is the failure mode of the prior `/agents`, `/prompts`, `/tools` flat library: too many doors, no point of view.

Caveat: Amazon's personalization is cookie-driven. We already have a role-toggle cookie. Add a `mml.lastViewed` cookie next.

---

## Visit progression

Reading this as a 2x2: persona by visit number. Concrete recommendations per cell, each tagged with the precedent.

| Persona | Visit 1 | Visit 5 | Visit 20 |
|---|---|---|---|
| **Sara** (research) | Show one card: TAMU AI Chat. Defer everything else behind "See all." (Apple) | Surface "Last viewed" (Amazon). Add a search box for prompts. | "What other faculty did this month" row (Netflix curated). Add nominate-a-prompt link. |
| **Marco** (teaching) | Lead with `/admin/evaluation-letters` and the rubric prompt. Hide BUILD tier. (Apple) | Bookmark-bundle: three-prompt cluster he can grab as one link. | Stable per-prompt URLs on `mays-method-lab.onrender.com`, not `maysai.vercel.app`. |
| **Linda** (head) | Skip the role grid for her. Deep-link from her email straight to `/admin/evaluation-letters`. (Amazon shortcut pattern) | She does not visit the LC page. She uses the app. | She forwards the LC URL. It must read as credible. |
| **Ashley** (coord) | TAMU AI Chat + announcement prompt above the fold. Cut tier four. (Apple) | Mays-domain prompt URLs, not Vercel. Phone-friendly copy buttons. | "What Mays staff built this month" row (Netflix curated). She is the row. |
| **Diana** (EA) | Search-by-task surface, not bucket grid. (Amazon search-first) | Starred-prompts cookie. (Amazon) | A "share these five steps" deep link she can paste into onboarding. |
| **Jen** (director) | She is fine with the bucket grid. (Netflix) | Surface BUILD tutorials with a "Pair with a student" CTA. | She is the BUILD-tier customer. Make this tier earn its space. |

Reading the table top to bottom: USE NOW is doing the heavy lifting on visit one for everyone. COPY-A-PROMPT does it on visit five. BUILD is only for visit twenty, and only for two of six personas. GO-DEEPER is mostly Linda and Sara. The four tiers exist, but they are weighted toward the top.

**Concrete navigation changes Hari should consider:**

1. **Collapse tiers two through four behind a "See more options" disclosure on visit one.** Apple-style. Detect first-time visitor via cookie absence. (Sara, Marco, Ashley.)
2. **Add a "Last viewed" strip above the bucket grid for returning visitors.** Three slots, cookie-stored. Amazon. (Marco, Diana.)
3. **Add one editorial row above the buckets: "What others at Mays did this month."** Netflix curated. Hari hand-picks five items. Refresh monthly. (Ashley, Jen.)
4. **Stable Mays-domain URLs for every prompt.** Migrate the `/prompts/*` content off `maysai.vercel.app` and onto `mays-method-lab.onrender.com/prompts/*`. (All staff personas. The cross-domain link is a credibility tax.)
5. **Add a "Pair with a student" CTA on every BUILD tile.** Reframes a 75-minute tutorial as a one-meeting ask. (Ashley, Jen.)

---

## Bucket taxonomy: A vs B vs C

### Option A: Hari's five (research / teaching / admin / communication / general AI learning)

Pros: clean, parallel, easy poster.

Cons: nobody on staff owns "admin" as a self-description. "Communication" you already disliked; personas confirm it is too abstract (they think "I have to write a letter," not "I have a communication problem"). And no role split. Sara and Ashley land on the same five, so Writing has to mean both "JM revision" and "newsletter draft."

### Option B: Currently shipped (faculty: research / teaching / writing / learning AI; staff: programs / supporting faculty / advising / writing / learning AI)

Pros: role-aware. Buckets named after recognizable work. Shared Writing handles cross-cutting cases.

Cons: nine total buckets to maintain. "Supporting faculty and departments" is too long and reads as faculty-support-only when it is really back-office. "Advising students" is thin (~5 advisors).

### Option C: Recommended

**Faculty (4):** Research, Teaching, Writing, Learning AI.
**Staff (5):** Programs, Faculty support, Advising, Writing, Learning AI.

Changes from Option B:
- "Supporting faculty and departments" → **Faculty support.** Scans on a phone.
- "Running programs" → **Programs.** Same.
- Keep Advising even at n=5. Better a small bucket than losing the Mora / Griffin / Jordan archetype inside Programs.
- Keep Writing as the cross-role shared bucket. Highest staff traffic, also fits department heads.
- "Learning AI" is an explicit fifth bucket, not a hidden afterthought. Same content both roles. (Hari's "general AI learning" instinct was right.)

Why C beats A: the role split keeps visit 1 tight. Sara never sees Programs. Ashley never sees Research.

Why C beats B: two label changes plus making Learning AI explicit. Option B is already 80 percent of C.

---

## Where /resources fits

The legacy `/resources` page lists TAMU-provided tools (TAMU AI Chat, Copilot, Gemini, NotebookLM, Power Automate, Zapier) plus four short guides. Reference content, not work content.

Recommendation: do both:

1. **Right-rail anchor on the role-landed grid.** A "TAMU-approved AI tools" tile sits to the right of the bucket grid on every load. One click goes to the tools index. Permanent home for compliance-conscious users (Linda, Diana).
2. **GO DEEPER tier of every bucket.** Already shipped. Keep it. Contextual home for users who chose a job first.

Keep the legacy `/resources` URL redirecting to `/tools` so existing bookmarks do not break.

---

## Open questions

- **Search box.** Diana and Marco both want one. The current page has none. Adding it is a real design decision (where does it live, what does it search). Flagging but not deciding here.
- **Deep linking.** Hari's URL credibility issue (Vercel vs Mays domain) is a migration problem, not a taxonomy problem. Out of scope for this doc but it is the single biggest change for staff trust.
- **Department-head persona.** Linda does not fit cleanly on the faculty side. Worth thinking about whether the faculty role should split into "research-active" and "administrative-faculty." Probably not worth a third role toggle, but the current Writing bucket has to serve her well, and right now it skews to the research-active case.

*End of doc.*
