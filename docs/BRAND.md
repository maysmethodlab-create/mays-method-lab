# Mays Method Lab — Brand & UI Guide

The Mays Method Lab website inherits its visual language from
**mays.tamu.edu**. Every value below is verified against the live Mays site
(computed CSS) so the lab reads as a Mays property without exception.

If you're building a new page or component, follow this guide. If you're
making a one-off visual change that breaks one of these rules, update this
document first and then change the code.

---

## 1. Color tokens

Defined in [tailwind.config.ts](../tailwind.config.ts).

| Token             | Hex       | Use                                                     |
|-------------------|-----------|---------------------------------------------------------|
| `maroon`          | `#500000` | Aggie Maroon. Headings, primary buttons, ribbon, logo.  |
| `maroon-deep`    | `#3C0000` | Link color, button border, hover state.                 |
| `maroon-muted`   | `#732F2F` | Eyebrows, dotted frame outline, muted maroon accents.   |
| `ink-primary`    | `#000000` | Strong text, body copy when emphasis matters.           |
| `ink-secondary`  | `#3E3E3E` | Default body paragraph color.                           |
| `ink-muted`      | `#5A5A5A` | Captions, helper text, footer copyright.                |
| `bg`             | `#FFFFFF` | Default background.                                     |
| `bg-subtle`      | `#EAEAEA` | Footer and alternating-section background.              |
| `line`           | `#D1D1D1` | Default 1px border / divider.                           |

Status colors (success / warning / error) are reserved for system feedback,
not decoration.

---

## 2. Typography

| Family          | Stack                                | Use                              |
|-----------------|--------------------------------------|----------------------------------|
| **Oswald**      | `'Oswald', Arial, sans-serif`        | All display headings (H1–H4).    |
| **Work Sans**   | `'"Work Sans"', Arial, sans-serif`   | All body, eyebrows, buttons, UI. |

Both fonts ship via Google Fonts at the top of `globals.css`. Do not add a
third font.

### Heading scale

```
h1   Oswald 400, sentence case, #500000, clamp(36px, 4.5vw, 48px), line 1.2
h2   Oswald 400, sentence case, #500000, clamp(30px, 3.2vw, 40px), line 1.2
h3   Oswald 600, sentence case, #500000, clamp(20px, 2.1vw, 25.6px), line 1.2
h4   Oswald 600, sentence case, #500000, 18px, line 1.3
```

**Critical: headings are NEVER uppercase, NEVER black, NEVER weight 800.**
Mays does not do that. The Lab does not do that.

### Eyebrows / superheads

Two flavors, both in `globals.css`:

```
.eyebrow      Work Sans 600, 13px, uppercase, letter-spacing 0.18em,
              color #732F2F. Used above H2/H3 in cards & sections.

.eyebrow-lg   Work Sans 500, 18px, uppercase, letter-spacing 0.05em,
              color #732F2F. Used above the H1 on a page header.
```

### Body

```
body                 Work Sans 400, 16px, line 1.5, #000000
.text-ink-secondary  Work Sans 400, 15-18px, line 1.5, #3E3E3E (default body paragraph)
```

---

## 3. Components

All component classes live in `globals.css`. Build pages against these,
don't reinvent.

### `.brand-ribbon`
The maroon strip at the very top of every page. Contains parent-link
breadcrumbs (TAMU → Mays) and is fixed across the whole layout. Do not
remove or restyle.

### `.card`
Flat white panel with a 1.5px `#732F2F` border, **0px radius, no shadow**,
28px padding. Hover deepens the border to full `#500000`. This is the
default surface for content blocks (leader bios, tools, fellows).

### `.dotted-frame`
The signature Mays element. A 2px dotted `#732F2F` outline with `-16px`
offset (the outline sits inside the box). Wrap a section's content in this
to give it the "Mission panel" treatment.

```html
<div class="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
  <div class="eyebrow-lg mb-3">Section Eyebrow</div>
  <h2>Big Oswald maroon heading.</h2>
  <p class="text-ink-secondary">Body copy.</p>
</div>
```

`.dotted-frame--invert` is the white version that projects 16px **outward**
— used on the hero card overlapping the video.

### `.btn-primary` / `.btn-secondary`
Work Sans 700, 16px, sentence case, **0px radius**, 2px deep-maroon border.
Primary fills with `#500000`; secondary stays white. Trailing arrow uses
the `.btn-arrow` class so it kerns correctly.

### `.input` / `.label`
Inputs are 0px radius with a 1px maroon border. Labels are uppercase Work
Sans 12px, color `#3E3E3E`, weight 700, tracked 0.06em. Used in the
evaluation-letter forms.

### `.heading-rule`
Centered section heading with horizontal maroon-muted hairlines on each
side. Used on Home → Leadership and About → Co-Directors.

### `.divider`
Dotted `#D1D1D1` 1px horizontal rule. Default section separator. Don't use
solid lines.

### `.section`
Page section wrapper: `max-width: 1280px`, horizontal padding 24/56px,
vertical padding 64/80px (responsive). Every page section uses this.

---

## 4. Page recipes

These are the patterns to copy when building a new page.

### Page header
```jsx
<section className="section pt-16">
  <div className="eyebrow-lg mb-3">Section Eyebrow</div>
  <h1 className="mb-6">Sentence-case page title.</h1>
  <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
    Lede paragraph in #3E3E3E.
  </p>
</section>
```

### Showcase / Mission panel
The "Mission" pattern from the Home page. Use this when a section deserves
extra visual weight.

```jsx
<section className="section">
  <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
    <div className="eyebrow-lg mb-3">Our Mission</div>
    <h2 className="mb-6 max-w-4xl">The big idea sentence.</h2>
    <p className="text-[18px] text-ink-secondary leading-relaxed max-w-3xl">
      Supporting paragraph.
    </p>
  </div>
</section>
```

### Three-up card grid (leadership / tools / fellows)
```jsx
<section className="section">
  <div className="heading-rule">
    <h2 className="text-center mx-auto">Section Title</h2>
  </div>
  <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-10">
    {items.map((item) => (
      <div className="card h-full">
        <div className="eyebrow text-[12px] mb-3">{item.role}</div>
        <h3 className="font-headline text-[26px] font-semibold text-maroon mb-3 leading-tight">
          {item.name}
        </h3>
        <p className="text-[15px] text-ink-secondary leading-relaxed">{item.note}</p>
      </div>
    ))}
  </div>
</section>
```

---

## 5. Things that look like Mays but aren't

Easy ways to break brand fidelity. Don't.

- **Drop shadows on cards.** Mays uses borders, not shadows.
- **Rounded corners on buttons or inputs.** Always 0px.
- **Uppercase H1/H2/H3.** Sentence case only.
- **Black headings.** Headings are `#500000`.
- **Solid 1px line dividers.** Use the dotted `.divider`.
- **Heavy letter-spacing on nav or buttons.** Mays uses normal tracking.
- **Two fonts other than Oswald + Work Sans.** No exceptions.
- **Hero text directly on top of video.** Use the `.hero-card` overlap pattern.

---

## 6. The Anthem hero (optional)

If a hero needs the Mays Anthem video as the background, the YouTube
embed is at <https://www.youtube.com/watch?v=zfZBXZ9wl54>. Embed via
iframe with `autoplay=1&mute=1&loop=1&playlist=zfZBXZ9wl54&controls=0`,
overlay a small play/pause button in the bottom-right corner, and keep
the white `.hero-card` floating over the bottom-left so text stays
legible regardless of the video frame.

---

## 7. When in doubt

Open <https://mays.tamu.edu> in a tab. If the lab UI looks like it
belongs on that site, you're done. If it doesn't, find the gap and fix
it before shipping.
