#!/usr/bin/env node
/**
 * Scrape the Mays Business School directory and produce a faculty roster
 * keyed by department. Uses the WP REST API to enumerate every entry, then
 * fetches each profile page and parses the bio-fullname / bio-title /
 * bio-department blocks from the rendered HTML.
 *
 * Output: src/lib/evaluation-letters/faculty-roster.json
 *
 * Run:  node scripts/scrape-faculty-roster.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  'evaluation-letters',
  'faculty-roster.json',
);

const REST_BASE = 'https://mays.tamu.edu/wp-json/wp/v2/directory';

// Departments we care about for the evaluation-letter app. Each is keyed by
// the department slug Mays uses in /departments/<slug>/ links.
const ACADEMIC_DEPTS = new Set([
  'accounting',
  'finance',
  'information-and-operations-management',
  'management',
  'marketing',
]);

const DEPT_DISPLAY = {
  accounting: 'James Benjamin Department of Accounting',
  finance: "Adam C. Sinn '00 Department of Finance",
  'information-and-operations-management': 'Department of Information and Operations Management',
  management: 'Department of Management',
  marketing: "Arch H. Aplin III '80 Department of Marketing",
};

async function fetchAllDirectoryStubs() {
  const out = [];
  for (let page = 1; page < 50; page += 1) {
    const url = `${REST_BASE}?per_page=100&page=${page}&_fields=id,slug,title,link`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break; // ran out of pages
      throw new Error(`REST ${url} returned ${res.status}`);
    }
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    out.push(...arr);
    if (arr.length < 100) break;
  }
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function clean(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

function parseProfile(html) {
  const result = {
    name: null,
    title: null,
    department: null,
    departmentSlug: null,
    email: null,
    phone: null,
    office: null,
    cvUrl: null,
  };

  const nameMatch = html.match(
    /<div class=['"]bio-fullname['"]>\s*<h1[^>]*>([\s\S]*?)<\/h1>/i,
  );
  if (nameMatch) result.name = clean(nameMatch[1]);

  const titleMatch = html.match(/<div class=['"]bio-title['"][^>]*>([\s\S]*?)<\/div>/i);
  if (titleMatch) {
    // Title block can contain multiple lines separated by <br>. Take the FIRST
    // line as the primary title; preserve the rest as a secondary line.
    const inner = titleMatch[1];
    const parts = inner
      .split(/<br\s*\/?>/i)
      .map((p) => clean(p))
      .filter(Boolean);
    result.title = parts[0] || null;
  }

  const deptMatch = html.match(
    /<div class=['"]bio-department['"][^>]*>\s*<a[^>]+href=['"]https:\/\/mays\.tamu\.edu\/departments\/([^/'"]+)\/?['"][^>]*>([\s\S]*?)<\/a>/i,
  );
  if (deptMatch) {
    result.departmentSlug = deptMatch[1];
    result.department = clean(deptMatch[2]);
  } else {
    // Some entries use plain text department.
    const altDept = html.match(/<div class=['"]bio-department['"][^>]*>([\s\S]*?)<\/div>/i);
    if (altDept) result.department = clean(altDept[1]);
  }

  const emailMatch = html.match(/href=['"]mailto:([^'"]+)['"]/i);
  if (emailMatch) result.email = emailMatch[1];

  // Phone is typically rendered as plain text in the contact list.
  const contactBlock = html.match(/<div class=['"]bio-contact['"][^>]*>([\s\S]*?)<\/div>/i);
  if (contactBlock) {
    const items = [...contactBlock[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) =>
      clean(m[1]),
    );
    for (const item of items) {
      if (/^\d{3}-\d{3}-\d{4}$/.test(item)) result.phone = item;
      else if (item && !item.includes('@') && !result.office) result.office = item;
    }
  }

  const cvMatch = html.match(
    /<div class=['"]bio-web-cv['"][^>]*>[\s\S]*?href=['"]([^'"]+\.pdf)['"]/i,
  );
  if (cvMatch) result.cvUrl = cvMatch[1];

  return result;
}

function suggestRoleCategory(title) {
  if (!title) return null;
  const t = title.toLowerCase();
  if (/department\s+head/.test(t)) return 'department-head';
  if (/(senior|associate|deputy)?\s*associate\s+dean|vice\s+dean/.test(t))
    return 'associate-dean';
  if (/professor\s+of\s+practice|executive\s+(assistant|associate)?\s*professor/.test(t))
    return 'apt-practice';
  if (/clinical\s+(assistant|associate)?\s*professor/.test(t)) return 'apt-clinical';
  if (/(principal|senior)?\s*lecturer/.test(t)) return 'apt-lecturer';
  if (/assistant\s+professor/.test(t)) return 'tt-assistant-professor';
  if (/associate\s+professor/.test(t)) return 'tt-associate-professor';
  if (/\bprofessor\b/.test(t)) return 'tt-professor';
  return null;
}

async function fetchProfile(stub) {
  const res = await fetch(stub.link);
  if (!res.ok) {
    return { stub, error: `HTTP ${res.status}` };
  }
  const html = await res.text();
  const parsed = parseProfile(html);
  // Prefer the parsed name (HTML) over the REST title — they should match,
  // but parsed gets diacritics right.
  return {
    id: stub.id,
    slug: stub.slug,
    link: stub.link,
    name: parsed.name || decodeEntities(stub.title.rendered),
    title: parsed.title,
    department: parsed.department,
    departmentSlug: parsed.departmentSlug,
    email: parsed.email,
    phone: parsed.phone,
    office: parsed.office,
    cvUrl: parsed.cvUrl,
    roleCategoryHint: suggestRoleCategory(parsed.title),
  };
}

(async () => {
  console.log('Fetching directory IDs from REST…');
  const stubs = await fetchAllDirectoryStubs();
  console.log(`Found ${stubs.length} directory entries. Fetching profile pages…`);

  const results = [];
  // Run with bounded concurrency so we don't hammer the site.
  const CONC = 8;
  for (let i = 0; i < stubs.length; i += CONC) {
    const chunk = stubs.slice(i, i + CONC);
    const out = await Promise.all(chunk.map((s) => fetchProfile(s).catch((e) => ({
      slug: s.slug,
      error: e.message,
    }))));
    results.push(...out);
    if ((i + CONC) % 40 === 0 || i + CONC >= stubs.length) {
      console.log(`  fetched ${Math.min(i + CONC, stubs.length)}/${stubs.length}`);
    }
  }

  const academic = results
    .filter((r) => r && !r.error && r.departmentSlug && ACADEMIC_DEPTS.has(r.departmentSlug))
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped = {};
  for (const r of academic) {
    const slug = r.departmentSlug;
    if (!grouped[slug]) {
      grouped[slug] = {
        departmentSlug: slug,
        departmentName: DEPT_DISPLAY[slug] || r.department,
        faculty: [],
      };
    }
    grouped[slug].faculty.push({
      name: r.name,
      title: r.title,
      department: r.department,
      email: r.email,
      phone: r.phone,
      office: r.office,
      profileUrl: r.link,
      cvUrl: r.cvUrl,
      roleCategoryHint: r.roleCategoryHint,
    });
  }

  const finalOutput = {
    scrapedAt: new Date().toISOString(),
    source: 'https://mays.tamu.edu/directory/',
    totalScraped: results.length,
    academicCount: academic.length,
    departments: Object.values(grouped),
  };

  fs.writeFileSync(OUT, JSON.stringify(finalOutput, null, 2));
  console.log('\nSummary:');
  console.log(`  Total directory entries:   ${results.length}`);
  console.log(`  In 5 academic depts:        ${academic.length}`);
  for (const g of Object.values(grouped)) {
    console.log(`    - ${g.departmentName.padEnd(60)} ${g.faculty.length}`);
  }
  console.log(`\nSaved: ${OUT}`);
})();
