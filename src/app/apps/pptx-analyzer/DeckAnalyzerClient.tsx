'use client';

import { useRef, useState } from 'react';
import type {
  DeckScanReport,
  DeckOverallRecommendation,
  ReliabilityStatus,
  AccessibilitySeverity,
} from '@/lib/pptx/deck-scanner';

const MAX_BYTES = 50 * 1024 * 1024;

type UiStage = 'idle' | 'uploading' | 'analyzing' | 'ready' | 'error';

const STATUS_BADGE: Record<ReliabilityStatus, { icon: string; label: string; color: string }> = {
  reliable: { icon: '✓', label: 'Reliable', color: 'bg-green-100 text-green-900 border-green-700' },
  degraded: { icon: '!', label: 'May degrade', color: 'bg-yellow-100 text-yellow-900 border-yellow-700' },
  unsupported: { icon: '✗', label: 'Cannot preserve', color: 'bg-red-100 text-red-900 border-red-700' },
};

const RECOMMENDATION_BLOCK: Record<
  DeckOverallRecommendation,
  { headline: string; body: string; banner: string }
> = {
  green: {
    headline: 'Clear to convert',
    body: 'Every element in this deck preserves cleanly under the Mays template. No surprises expected.',
    banner: 'bg-green-100 border-green-700 text-green-900',
  },
  yellow: {
    headline: 'Convert with eyes open',
    body: 'Most elements preserve cleanly, but a few will degrade slightly (charts, animations, or tables with merged cells). Review the table below before proceeding.',
    banner: 'bg-yellow-100 border-yellow-700 text-yellow-900',
  },
  orange: {
    headline: 'Partial conversion recommended',
    body: 'Some slides contain elements that cannot be reliably preserved (embedded video, embedded objects, or ink). The conversion can succeed for the rest of the deck; the affected slides should be processed manually.',
    banner: 'bg-orange-100 border-orange-700 text-orange-900',
  },
  red: {
    headline: 'Not recommended',
    body: 'Most of this deck contains elements the tool cannot reliably preserve. Recommend redesigning the deck against the Mays template manually, or process slide-by-slide.',
    banner: 'bg-red-100 border-red-700 text-red-900',
  },
};

const SEVERITY_BADGE: Record<AccessibilitySeverity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-900 border-red-700' },
  major: { label: 'Major', color: 'bg-orange-100 text-orange-900 border-orange-700' },
  minor: { label: 'Minor', color: 'bg-yellow-100 text-yellow-900 border-yellow-700' },
  info: { label: 'Info', color: 'bg-blue-100 text-blue-900 border-blue-700' },
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function DeckAnalyzerClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<UiStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DeckScanReport | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setReport(null);
    setFileName(file.name);

    if (file.size > MAX_BYTES) {
      setStage('error');
      setError(`File too large (${formatBytes(file.size)}). Limit is 50 MB.`);
      return;
    }
    if (!/\.(pptx|pptm)$/i.test(file.name)) {
      setStage('error');
      setError('Upload a .pptx or .pptm file.');
      return;
    }

    setStage('uploading');
    const fd = new FormData();
    fd.append('file', file);

    try {
      setStage('analyzing');
      const res = await fetch('/api/apps/pptx-analyzer/scan', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setStage('error');
        setError(j?.error || `Server returned ${res.status}.`);
        return;
      }
      const body = (await res.json()) as DeckScanReport;
      setReport(body);
      setStage('ready');
    } catch (e) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Network error.');
    }
  }

  function reset() {
    setStage('idle');
    setError(null);
    setReport(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
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
            Deck Analyzer
          </h1>
          <span className="inline-block px-3 py-1 bg-maroon text-white text-[16px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
            Beta
          </span>
        </div>
        <p className="text-[17px] text-ink-secondary leading-relaxed">
          Upload a PowerPoint deck. The Analyzer scans every slide and tells you (a) which
          elements can be reliably converted to the Mays template, (b) where you have
          accessibility gaps, and (c) whether the deck is a fit for the converter at all.
          No content leaves your browser longer than the scan.
        </p>
      </header>

      {stage === 'idle' && (
        <UploadCard inputRef={inputRef} onFile={handleFile} />
      )}

      {(stage === 'uploading' || stage === 'analyzing') && (
        <section className="bg-white border-2 border-maroon p-6 md:p-8 max-w-3xl">
          <div className="text-[16px] uppercase tracking-[0.18em] text-maroon font-semibold mb-2">
            Scanning
          </div>
          <h2 className="text-xl m-0 mb-2">{fileName}</h2>
          <p className="text-ink-secondary m-0">
            {stage === 'uploading' ? 'Uploading…' : 'Walking each slide and counting elements…'}
          </p>
        </section>
      )}

      {stage === 'error' && (
        <section className="bg-red-100 border-2 border-red-700 p-6 max-w-3xl">
          <div className="text-[16px] uppercase tracking-[0.18em] text-red-900 font-semibold mb-2">
            Error
          </div>
          <p className="m-0 mb-4 text-red-900">{error}</p>
          <button
            type="button"
            onClick={reset}
            className="btn-secondary"
            style={{ borderColor: '#7f1d1d', color: '#7f1d1d' }}
          >
            Try another file
          </button>
        </section>
      )}

      {stage === 'ready' && report && (
        <ReportView report={report} onReset={reset} />
      )}
    </div>
  );
}

function UploadCard({
  inputRef,
  onFile,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <section
      className="bg-white border-2 border-maroon p-6 md:p-10 relative max-w-3xl"
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      style={{ outline: hover ? '2px dashed #500000' : undefined, outlineOffset: '-12px' }}
    >
      <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />
      <div className="relative z-10">
        <div className="text-[16px] uppercase tracking-[0.18em] text-maroon font-semibold mb-2">
          Upload a deck
        </div>
        <h2 className="text-xl m-0 mb-3">Drag a .pptx file here, or click to choose one</h2>
        <p className="text-ink-secondary m-0 mb-6">
          50 MB limit. The file is scanned in memory and not saved.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-primary"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pptx,.pptm,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          style={{ display: 'none' }}
        />
      </div>
    </section>
  );
}

function ReportView({
  report,
  onReset,
}: {
  report: DeckScanReport;
  onReset: () => void;
}) {
  const block = RECOMMENDATION_BLOCK[report.reliability.recommendation];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header card with deck info + reset button */}
      <section className="bg-white border-2 border-maroon p-6 md:p-8 relative">
        <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[16px] uppercase tracking-[0.18em] text-maroon font-semibold mb-2">
              Scan complete
            </div>
            <h2 className="text-xl m-0 mb-1">{report.deck.fileName}</h2>
            <p className="text-ink-secondary m-0 text-[16px]">
              {report.deck.slideCount} slide{report.deck.slideCount === 1 ? '' : 's'} ·{' '}
              {formatBytes(report.deck.fileSize)} · {report.deck.fileFormat.toUpperCase()}
            </p>
          </div>
          <button type="button" onClick={onReset} className="btn-secondary">
            Scan another deck
          </button>
        </div>
      </section>

      {/* Parse error banner if any */}
      {report.deck.parseError && (
        <section className="bg-red-100 border-2 border-red-700 p-6">
          <div className="text-[16px] uppercase tracking-[0.18em] text-red-900 font-semibold mb-2">
            Cannot analyze this file
          </div>
          <p className="m-0 text-red-900">{report.deck.parseError}</p>
        </section>
      )}

      {/* Top-level recommendation */}
      {!report.deck.parseError && (
        <section className={`border-2 p-6 ${block.banner}`}>
          <div className="text-[16px] uppercase tracking-[0.18em] font-semibold mb-2">
            Conversion verdict
          </div>
          <h2 className="text-2xl m-0 mb-2">{block.headline}</h2>
          <p className="m-0 text-[16px] leading-relaxed">{block.body}</p>
          <div className="mt-4 text-[16px] flex flex-wrap gap-4">
            <span>
              <strong>{report.reliability.summary.reliable}</strong> slide
              {report.reliability.summary.reliable === 1 ? '' : 's'} convert cleanly
            </span>
            <span>
              <strong>{report.reliability.summary.degraded}</strong> with minor
              degradation
            </span>
            <span>
              <strong>{report.reliability.summary.unsupported}</strong> with
              unsupported content
            </span>
          </div>
        </section>
      )}

      {/* Reliability findings table */}
      {report.reliability.findings.length > 0 && (
        <section className="bg-white border-2 border-line p-6">
          <h3 className="text-lg m-0 mb-4 text-ink-primary">Element-by-element reliability</h3>
          <table className="w-full text-[16px]">
            <thead>
              <tr className="border-b-2 border-maroon">
                <th className="text-left py-2 pr-4 font-semibold uppercase tracking-[0.05em] text-[16px] text-ink-secondary">
                  Element
                </th>
                <th className="text-right py-2 px-4 font-semibold uppercase tracking-[0.05em] text-[16px] text-ink-secondary">
                  Count
                </th>
                <th className="text-left py-2 px-4 font-semibold uppercase tracking-[0.05em] text-[16px] text-ink-secondary">
                  Status
                </th>
                <th className="text-left py-2 pl-4 font-semibold uppercase tracking-[0.05em] text-[16px] text-ink-secondary">
                  What happens on conversion
                </th>
              </tr>
            </thead>
            <tbody>
              {report.reliability.findings.map((f) => {
                const badge = STATUS_BADGE[f.status];
                return (
                  <tr key={f.type} className="border-b border-line align-top">
                    <td className="py-3 pr-4 font-medium">{f.type}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{f.count}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-[16px] uppercase tracking-[0.05em] font-semibold border ${badge.color}`}
                      >
                        {badge.icon} {badge.label}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-ink-secondary">{f.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Per-slide reliability breakdown (only when there are non-reliable slides) */}
      {report.reliability.perSlide.some((s) => s.status !== 'reliable') && (
        <section className="bg-white border-2 border-line p-6">
          <h3 className="text-lg m-0 mb-4 text-ink-primary">
            Slides that need attention
          </h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {report.reliability.perSlide
              .filter((s) => s.status !== 'reliable')
              .map((s) => {
                const badge = STATUS_BADGE[s.status];
                return (
                  <li
                    key={s.slideIndex}
                    className="flex flex-wrap items-center gap-3 border-l-4 border-maroon-muted pl-3 py-1"
                  >
                    <span className="font-semibold tabular-nums">Slide {s.slideIndex}</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[16px] uppercase tracking-[0.05em] font-semibold border ${badge.color}`}
                    >
                      {badge.icon} {badge.label}
                    </span>
                    <span className="text-ink-secondary text-[16px]">
                      {s.reasons.join(', ')}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {/* Accessibility findings */}
      <section className="bg-white border-2 border-line p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
          <h3 className="text-lg m-0 text-ink-primary">Accessibility</h3>
          <div className="text-[16px] text-ink-secondary">
            Score: <strong className="text-ink-primary">{report.accessibility.score}/100</strong>
          </div>
        </div>
        <div className="text-[16px] text-ink-secondary mb-4 flex flex-wrap gap-3">
          <span>
            <strong className="text-red-900">{report.accessibility.summary.critical}</strong> critical
          </span>
          <span>
            <strong className="text-orange-900">{report.accessibility.summary.major}</strong> major
          </span>
          <span>
            <strong className="text-yellow-900">{report.accessibility.summary.minor}</strong> minor
          </span>
        </div>
        {report.accessibility.issues.length === 0 ? (
          <p className="m-0 text-ink-secondary">No accessibility issues detected.</p>
        ) : (
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {report.accessibility.issues.map((iss, i) => {
              const badge = SEVERITY_BADGE[iss.severity];
              return (
                <li
                  key={i}
                  className="flex flex-wrap items-start gap-3 border-l-4 border-maroon-muted pl-3 py-1"
                >
                  <span className="font-semibold tabular-nums whitespace-nowrap">
                    Slide {iss.slideIndex}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[16px] uppercase tracking-[0.05em] font-semibold border ${badge.color} whitespace-nowrap`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-ink-secondary text-[16px]">{iss.description}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-[16px] text-ink-muted m-0 max-w-3xl">
        This is a static analysis — no LLM, no file persistence. Re-running on the same file
        will give the same result. The conversion tool itself does not exist yet; this
        Analyzer is the pre-flight feature shipped first so you can see what the converter
        would do before it's built.
      </p>
    </div>
  );
}
