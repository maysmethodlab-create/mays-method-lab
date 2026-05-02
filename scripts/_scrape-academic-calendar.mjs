#!/usr/bin/env node
/**
 * Scrape the TAMU registrar academic calendar and capture every event
 * tagged Fall 2025, Spring 2026, Summer 2026, and Fall 2026. Output a
 * single JSON file used by the Academic Calendar Chatbot at
 * /apps/academic-calendar.
 *
 * Source: https://registrar.tamu.edu/academic-calendar (the page itself
 * is a JS-rendered SPA with no server-rendered tables, but it links to
 * iCal feeds keyed by semester tag — those feeds are fully parseable
 * static text). We pull each semester's iCal feed, extract VEVENTs, and
 * fold them into the output. Falls back to a hand-written canonical set
 * of dates if the live feeds fail.
 *
 * Output: data/sources/academic-calendar.json (gitignored)
 *
 * Run:  node scripts/_scrape-academic-calendar.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'data', 'sources');
const OUT = path.join(OUT_DIR, 'academic-calendar.json');
const PUBLIC_URL = 'https://registrar.tamu.edu/academic-calendar';

const SEMESTER_TAGS = [
  { name: 'Fall 2025', tag: 'fall 2025' },
  { name: 'Spring 2026', tag: 'spring 2026' },
  { name: 'Summer 2026', tag: 'summer 2026' },
  { name: 'Fall 2026', tag: 'fall 2026' },
];

const ICAL_BASE = 'https://calendar.tamu.edu/live/ical/events/group/Office%20of%20the%20Registrar/tag/';

function buildIcalUrl(tag) {
  // The TAMU calendar feed accepts /tag/<tag>/start_date/-2 years/end_date/+2 years
  return `${ICAL_BASE}${encodeURIComponent(tag)}/start_date/-2%20years/end_date/%2B2%20years`;
}

/** Strip HTML and decode common entities from livewhale summary fields. */
function clean(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\n/g, ' ')
    .replace(/\\;/g, ';')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Unfold iCal continuation lines (RFC 5545: lines starting with space/tab continue the previous line). */
function unfold(ical) {
  return ical.replace(/\r?\n[ \t]/g, '');
}

/** Parse a yyyymmdd or yyyymmddThhmmssZ string into a human-friendly "Mon DD, YYYY" form. */
function formatDate(raw) {
  if (!raw) return '';
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(raw);
  if (!m) return raw;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const y = m[1];
  const month = months[Number(m[2]) - 1] || m[2];
  const d = String(Number(m[3]));
  return `${month} ${d}, ${y}`;
}

/** Extract VEVENT blocks. Returns array of { date, title, raw }. */
function parseIcal(ical) {
  const unfolded = unfold(ical);
  const events = [];
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m;
  while ((m = re.exec(unfolded)) !== null) {
    const block = m[1];
    const get = (key) => {
      const r = new RegExp(`(?:^|\\n)${key}[^:\\n]*:([^\\n]*)`, 'i');
      const x = r.exec(block);
      return x ? x[1].trim() : '';
    };
    const dtstart = get('DTSTART');
    const dtend = get('DTEND');
    const summary = get('SUMMARY');
    const description = clean(get('X-LIVEWHALE-SUMMARY'));
    if (!dtstart || !summary) continue;
    const startStr = formatDate(dtstart);
    // If multi-day all-day event, dtend is exclusive in iCal — show range
    let dateStr = startStr;
    if (/^\d{8}$/.test(dtstart) && /^\d{8}$/.test(dtend) && dtstart !== dtend) {
      // all-day range; subtract a day from dtend to get inclusive end
      const y = Number(dtend.slice(0, 4));
      const mo = Number(dtend.slice(4, 6));
      const d = Number(dtend.slice(6, 8));
      const endDate = new Date(Date.UTC(y, mo - 1, d - 1));
      const incEnd = `${endDate.getUTCFullYear()}${String(endDate.getUTCMonth() + 1).padStart(2, '0')}${String(endDate.getUTCDate()).padStart(2, '0')}`;
      if (incEnd !== dtstart) {
        dateStr = `${startStr} – ${formatDate(incEnd)}`;
      }
    }
    events.push({
      date: dateStr,
      title: clean(summary),
      description,
    });
  }
  return events;
}

async function fetchSemester(name, tag) {
  const url = buildIcalUrl(tag);
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MaysMethodLabBot/1.0; +https://mays.tamu.edu)',
      Accept: 'text/calendar,*/*;q=0.5',
    },
  });
  if (!r.ok) {
    throw new Error(`iCal fetch failed for ${name}: HTTP ${r.status}`);
  }
  const text = await r.text();
  return parseIcal(text);
}

const FALLBACK_CALENDAR = {
  semesters: [
    {
      name: 'Fall 2025',
      events: [
        { date: 'Aug 25, 2025', title: 'First day of class' },
        { date: 'Aug 29, 2025', title: 'Last day to add or drop a class without a record on the transcript' },
        { date: 'Sep 1, 2025', title: 'Labor Day. University holiday.' },
        { date: 'Oct 17, 2025', title: 'Mid-semester grade reports due for undergraduate students' },
        { date: 'Nov 7, 2025', title: 'Last day to Q-drop a course or withdraw from the university with no penalty' },
        { date: 'Nov 26, 2025 – Nov 28, 2025', title: 'Thanksgiving break. No classes.' },
        { date: 'Dec 5, 2025', title: 'Last day of fall semester classes (redefined Friday)' },
        { date: 'Dec 8, 2025 – Dec 9, 2025', title: 'Reading days' },
        { date: 'Dec 10, 2025 – Dec 16, 2025', title: 'Final examinations' },
        { date: 'Dec 12, 2025', title: 'Graduate degree commencement' },
        { date: 'Dec 13, 2025', title: 'Undergraduate commencement' },
        { date: 'Dec 17, 2025', title: 'Final grades due from instructors' },
      ],
    },
    {
      name: 'Spring 2026',
      events: [
        { date: 'Jan 9, 2026', title: '5 p.m., Last Day of Open Registration for Spring 2026 Classes' },
        { date: 'Jan 12, 2026', title: 'First day of class' },
        { date: 'Jan 19, 2026', title: 'Martin Luther King Jr. Day. University holiday.' },
        { date: 'Jan 23, 2026', title: 'Last day to add or drop a class without a record on the transcript' },
        { date: 'Mar 9, 2026 – Mar 13, 2026', title: 'Spring break. No classes.' },
        { date: 'Mar 27, 2026', title: 'Mid-semester grade reports due for undergraduate students' },
        { date: 'Apr 21, 2026', title: 'Last day to Q-drop a course or withdraw from the university with no penalty' },
        { date: 'Apr 28, 2026', title: 'Last day of spring semester classes (redefined Friday)' },
        { date: 'Apr 29, 2026 – Apr 30, 2026', title: 'Reading days' },
        { date: 'May 1, 2026 – May 7, 2026', title: 'Final examinations' },
        { date: 'May 7, 2026', title: 'Graduate degree commencement' },
        { date: 'May 8, 2026 – May 9, 2026', title: 'Undergraduate commencement' },
        { date: 'May 11, 2026', title: 'Final grades due from instructors' },
      ],
    },
    {
      name: 'Summer 2026',
      events: [
        { date: 'May 18, 2026', title: '10-week and First 5-week summer session classes begin' },
        { date: 'May 25, 2026', title: 'Memorial Day. University holiday.' },
        { date: 'Jun 19, 2026', title: 'Juneteenth. University holiday.' },
        { date: 'Jun 22, 2026', title: 'First 5-week session final examinations' },
        { date: 'Jun 23, 2026', title: 'Second 5-week summer session classes begin' },
        { date: 'Jul 3, 2026', title: 'Independence Day observed. University holiday.' },
        { date: 'Jul 24, 2026', title: '10-week session final examinations' },
        { date: 'Jul 28, 2026', title: 'Second 5-week session final examinations' },
        { date: 'Aug 1, 2026', title: 'Summer commencement' },
      ],
    },
  ],
};

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const semesters = [];
  let usedFallback = false;
  const errors = [];

  for (const s of SEMESTER_TAGS) {
    try {
      const events = await fetchSemester(s.name, s.tag);
      if (events.length > 0) {
        semesters.push({ name: s.name, events });
        console.log(`  ${s.name}: ${events.length} events from iCal feed.`);
      } else {
        console.warn(`  ${s.name}: feed returned 0 events.`);
        errors.push(`${s.name}: 0 events`);
      }
    } catch (e) {
      console.warn(`  ${s.name}: ${e.message}`);
      errors.push(`${s.name}: ${e.message}`);
    }
  }

  let result = { semesters };
  if (semesters.length === 0) {
    console.warn('No semesters scraped. Using hand-written fallback.');
    result = FALLBACK_CALENDAR;
    usedFallback = true;
  }

  const totalEvents = result.semesters.reduce((n, s) => n + s.events.length, 0);

  const output = {
    academicYear: '2025-2026',
    sourceUrl: PUBLIC_URL,
    scrapedAt: new Date().toISOString(),
    usedFallback,
    semesters: result.semesters,
    totalEvents,
    notes:
      'Scraped from the TAMU registrar Office calendar iCal feeds (one feed per semester tag). Falls back to a hand-written canonical set if the feeds are unavailable.',
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(
    `Wrote ${OUT}: ${result.semesters.length} semester(s), ${totalEvents} event(s)${usedFallback ? ' [FALLBACK]' : ''}.`,
  );
  if (errors.length) console.log('Notices:', errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
