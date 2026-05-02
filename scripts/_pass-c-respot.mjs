#!/usr/bin/env node
// Pass Bar C re-spot-check after Fixer 7
// 3-turn conversation, full history threaded each request

import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://mays-method-lab.onrender.com';
const PASSWORD = 'mml-dev2026';

const turns = [
  "What's the timeline for promotion to full professor at Mays?",
  "I'm an associate professor prepping for promotion to full.",
  "What's the difference between the annual review and the third-year review?",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForLive() {
  for (let i = 0; i < 10; i++) {
    const r = await fetch(`${BASE}/apps/faculty-guidelines`, {
      redirect: 'manual',
    });
    console.error(`[wait] attempt ${i + 1}: ${r.status}`);
    if (r.status === 307 || r.status === 200 || r.status === 302) return true;
    await sleep(60_000);
  }
  return false;
}

async function authenticate() {
  const r = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Auth failed ${r.status}: ${txt}`);
  }
  // Pick up Set-Cookie header(s)
  const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get('set-cookie')];
  const cookies = (setCookie || [])
    .filter(Boolean)
    .map((c) => c.split(';')[0])
    .join('; ');
  if (!cookies) throw new Error('No cookies returned from auth');
  console.error(`[auth] OK, cookies length=${cookies.length}`);
  return cookies;
}

async function chat(cookieHeader, history) {
  const r = await fetch(`${BASE}/api/apps/faculty-guidelines/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ messages: history }),
  });
  const txt = await r.text();
  if (!r.ok) {
    throw new Error(`Chat failed ${r.status}: ${txt}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(txt);
  } catch {
    parsed = { raw: txt };
  }
  return parsed;
}

async function main() {
  const live = await waitForLive();
  if (!live) {
    throw new Error('Render deployment did not become live within 10 minutes');
  }

  const cookieHeader = await authenticate();

  const history = [];
  const rawLines = [];

  for (let i = 0; i < turns.length; i++) {
    const userMsg = turns[i];
    history.push({ role: 'user', content: userMsg });
    console.error(`\n[turn ${i + 1}] >>> ${userMsg}`);

    const t0 = Date.now();
    const resp = await chat(cookieHeader, history);
    const ms = Date.now() - t0;

    const assistantText =
      resp?.message ||
      resp?.content ||
      resp?.assistant ||
      resp?.response ||
      resp?.text ||
      JSON.stringify(resp);

    console.error(`[turn ${i + 1}] <<< (${ms}ms) ${assistantText.slice(0, 200)}...`);

    history.push({ role: 'assistant', content: assistantText });

    rawLines.push(
      JSON.stringify({
        turn: i + 1,
        user: userMsg,
        response_raw: resp,
        assistant_text: assistantText,
        ms,
        ts: new Date().toISOString(),
      }),
    );

    if (i < turns.length - 1) {
      await sleep(3000);
    }
  }

  const cwd = process.cwd();
  const rawPath = path.join(cwd, 'docs', 'v3-pass-c-respot-raw.jsonl');
  await fs.writeFile(rawPath, rawLines.join('\n') + '\n', 'utf8');
  console.error(`[done] raw written -> ${rawPath}`);

  // Print Turn 3 to stdout for analysis
  const t3 = JSON.parse(rawLines[2]);
  console.log('\n========== TURN 3 RAW ==========');
  console.log(t3.assistant_text);
  console.log('========== END TURN 3 ==========\n');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
