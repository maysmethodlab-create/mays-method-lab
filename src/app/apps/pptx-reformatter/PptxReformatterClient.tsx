'use client';

import { useRef, useState } from 'react';

/**
 * PowerPoint Reformatter client. Single-page upload + progress UI.
 *
 * The pipeline runs server-side in one POST to /api/apps/pptx-
 * reformatter/process. The client cannot subscribe to per-step events
 * over a single fetch, so the progress indicator instead walks through
 * the six stages on a timer while the server works. When the response
 * lands the indicator jumps to "ready". This is honest about the work
 * happening without faking server-sent events.
 */

type Stage =
  | 'idle'
  | 'uploading'
  | 'synthesizing'
  | 'studying-brand'
  | 'planning'
  | 'reviewing'
  | 'accessibility-pass'
  | 'generating'
  | 'ready'
  | 'error';

const STAGE_LABELS: Record<Exclude<Stage, 'idle' | 'error'>, string> = {
  uploading: 'Uploading deck',
  synthesizing: '1. Reading the deck',
  'studying-brand': '2. Studying Mays layouts',
  planning: '3. Planning the new deck',
  reviewing: '4. Aesthetic review',
  'accessibility-pass': '5. Accessibility pass',
  generating: '6. Generating .pptx',
  ready: 'Ready to download',
};

const ORDERED_STAGES: Array<Exclude<Stage, 'idle' | 'error'>> = [
  'uploading',
  'synthesizing',
  'studying-brand',
  'planning',
  'reviewing',
  'accessibility-pass',
  'generating',
  'ready',
];

type ProcessResponse = {
  ok: boolean;
  id: string;
  pptxUrl: string;
  accessibilityReportUrl: string;
  slideCount: number;
  sourceSlideCount: number;
  accessibilityScore: number;
  passedCount: number;
  autoFixedCount: number;
  needsReviewCount: number;
};

const MAX_BYTES = 25 * 1024 * 1024;

export default function PptxReformatterClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileName(file.name);
    if (file.size > MAX_BYTES) {
      setStage('error');
      setError(`File too large. Limit is ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }
    if (!/\.pptx$/i.test(file.name)) {
      setStage('error');
      setError('Only .pptx files are supported.');
      return;
    }

    setStage('uploading');

    // Walk through the visible stages on a timer. The actual server
    // response can land at any time; whichever arrives first wins.
    const stageTimers: ReturnType<typeof setTimeout>[] = [];
    const advance = (s: Stage, ms: number) =>
      stageTimers.push(setTimeout(() => setStage(s), ms));

    advance('synthesizing', 1500);
    advance('studying-brand', 6000);
    advance('planning', 12000);
    advance('reviewing', 22000);
    advance('accessibility-pass', 32000);
    advance('generating', 42000);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/apps/pptx-reformatter/process', {
        method: 'POST',
        body: fd,
      });
      // Cancel any pending visible-stage advances.
      stageTimers.forEach((t) => clearTimeout(t));
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setStage('error');
        setError(j?.error || `Server returned ${res.status}.`);
        return;
      }
      const body = (await res.json()) as ProcessResponse;
      setResult(body);
      setStage('ready');
    } catch (e) {
      stageTimers.forEach((t) => clearTimeout(t));
      setStage('error');
      setError(e instanceof Error ? e.message : 'Network error.');
    }
  }

  function onPickClick() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <div className="eyebrow-lg mb-3">Mays Method Lab · Apps</div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1
            className="leading-[1.1] text-maroon m-0"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
          >
            PowerPoint Reformatter
          </h1>
          <span className="inline-block px-3 py-1 bg-maroon text-white text-[16px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
            Beta
          </span>
        </div>
        <p className="text-[17px] text-ink-secondary leading-relaxed">
          Upload any messy deck. Get back a Mays-brand-compliant, ADA-accessible version. Six-step AI pipeline runs on the cheapest model so you can use it freely.
        </p>
      </header>

      <section className="bg-white border-2 border-maroon p-6 md:p-8 relative max-w-3xl">
        <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />

        {stage === 'idle' && (
          <div className="flex flex-col gap-4">
            <div className="eyebrow-lg font-headline text-maroon">Upload your deck</div>
            <p className="text-[16px] text-ink-primary leading-relaxed">
              Drop a .pptx file (max 25 MB, up to 60 slides). The pipeline reads
              every slide, picks Mays layouts, rewrites headlines into sentence case,
              enforces 18pt body and 28pt heading minimums, and ships an
              accessibility report alongside the deck.
            </p>
            <div>
              <button
                type="button"
                onClick={onPickClick}
                className="inline-block px-5 py-3 bg-maroon text-white font-semibold uppercase tracking-[0.12em] text-[16px] hover:bg-maroon-deep"
                style={{ borderRadius: 0 }}
              >
                Choose a .pptx file
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            <p className="text-[16px] text-ink-secondary">
              Files stay on the server. Outputs are private and tied to your session.
            </p>
          </div>
        )}

        {stage !== 'idle' && stage !== 'error' && (
          <div className="flex flex-col gap-4">
            <div className="eyebrow-lg font-headline text-maroon">
              {stage === 'ready' ? 'Ready' : 'Working'}
            </div>
            {fileName && (
              <p className="text-[16px] text-ink-secondary">
                Source: <span className="font-semibold text-ink-primary">{fileName}</span>
              </p>
            )}
            <ol className="flex flex-col gap-2 m-0 p-0 list-none">
              {ORDERED_STAGES.map((s) => {
                const idx = ORDERED_STAGES.indexOf(s);
                const cur = ORDERED_STAGES.indexOf(stage as typeof ORDERED_STAGES[number]);
                const status = idx < cur ? 'done' : idx === cur ? 'active' : 'todo';
                return (
                  <li
                    key={s}
                    className="flex items-center gap-3 text-[16px]"
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={
                        'inline-block w-3 h-3 ' +
                        (status === 'done'
                          ? 'bg-maroon'
                          : status === 'active'
                            ? 'bg-maroon-muted animate-pulse'
                            : 'bg-bg-soft border border-maroon-muted')
                      }
                    />
                    <span
                      className={
                        status === 'todo'
                          ? 'text-ink-secondary'
                          : status === 'active'
                            ? 'text-ink-primary font-semibold'
                            : 'text-ink-primary'
                      }
                    >
                      {STAGE_LABELS[s]}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {stage === 'ready' && result && (
          <div className="flex flex-col gap-4 mt-6">
            <div className="border-t border-maroon-muted pt-4">
              <div className="eyebrow-lg font-headline text-maroon mb-2">Results</div>
              <ul className="text-[16px] text-ink-primary leading-relaxed list-none p-0 m-0 flex flex-col gap-1">
                <li>
                  Source slide count: <span className="font-semibold">{result.sourceSlideCount}</span>
                </li>
                <li>
                  Branded slide count: <span className="font-semibold">{result.slideCount}</span>
                </li>
                <li>
                  Accessibility score:{' '}
                  <span className="font-semibold">{result.accessibilityScore}/100</span>
                </li>
                <li>
                  Passed: {result.passedCount}; auto-fixed: {result.autoFixedCount};
                  needs human review: {result.needsReviewCount}
                </li>
              </ul>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a
                href={result.pptxUrl}
                className="inline-block px-5 py-3 bg-maroon text-white font-semibold uppercase tracking-[0.12em] text-[16px] hover:bg-maroon-deep"
                style={{ borderRadius: 0 }}
              >
                Download .pptx
              </a>
              <a
                href={result.accessibilityReportUrl}
                className="inline-block px-5 py-3 bg-white text-maroon border-2 border-maroon font-semibold uppercase tracking-[0.12em] text-[16px] hover:bg-bg-soft"
                style={{ borderRadius: 0 }}
              >
                Download accessibility report
              </a>
              <button
                type="button"
                onClick={() => {
                  setStage('idle');
                  setResult(null);
                  setFileName(null);
                  setError(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="inline-block px-5 py-3 bg-bg-soft text-ink-primary border border-maroon-muted font-semibold uppercase tracking-[0.12em] text-[16px] hover:bg-white"
                style={{ borderRadius: 0 }}
              >
                Reformat another deck
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col gap-3">
            <div className="eyebrow-lg font-headline text-maroon">Something went wrong</div>
            <p className="text-[16px] text-ink-primary leading-relaxed">
              {error || 'Unknown error.'}
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setStage('idle');
                  setError(null);
                  setFileName(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="inline-block px-5 py-3 bg-maroon text-white font-semibold uppercase tracking-[0.12em] text-[16px] hover:bg-maroon-deep"
                style={{ borderRadius: 0 }}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="max-w-3xl">
        <div className="eyebrow-lg font-headline text-maroon mb-3">What the pipeline does</div>
        <ol className="list-decimal pl-6 text-[16px] text-ink-primary leading-relaxed flex flex-col gap-2">
          <li>Reads every slide and labels its purpose (title, section, content, two-column, data, image, closing).</li>
          <li>Picks the best Mays layout for each slide.</li>
          <li>Plans new headlines, body copy, and bullets that respect the brand caps.</li>
          <li>Critiques the plan and rewrites weak spots.</li>
          <li>Runs an accessibility pass: alt text, screen-reader titles, reading order, contrast, minimum type size, descriptive hyperlinks, color-only flags.</li>
          <li>Writes a Mays-branded, ADA-aware .pptx and a plain-text accessibility report.</li>
        </ol>
        <p className="text-[16px] text-ink-secondary mt-4">
          Beta. The pipeline does its best with vanilla decks; complex tables, embedded charts, and SmartArt may flag for human review. Tell us what is missing at{' '}
          <a href="mailto:ssridhar@mays.tamu.edu?subject=PowerPoint%20Reformatter%20feedback" className="prose-link font-semibold">
            ssridhar@mays.tamu.edu
          </a>
          .
        </p>
      </section>
    </div>
  );
}
