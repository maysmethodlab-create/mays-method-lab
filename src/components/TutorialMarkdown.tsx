import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Lightweight markdown renderer for tutorial bodies.
 *
 * Handles only the subset we use in src/lib/tutorials.ts:
 *   - ## and ### headings (Oswald maroon)
 *   - paragraphs
 *   - unordered lists (- or *)
 *   - ordered lists (1. 2. 3.)
 *   - inline code with backticks
 *   - **bold**
 *   - links with [text](href). Internal hrefs (start with /) render as
 *     Next.js Link; everything else opens in a new tab.
 *
 * No external markdown dependency. Keeps the bundle small and the brand
 * exactly under our control. If we need more markdown coverage, add cases
 * here rather than pulling in a parser.
 */

export default function TutorialMarkdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="prose-tutorial">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

type ParsedBlock =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] };

function parseBlocks(source: string): ParsedBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out: ParsedBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // Headings.
    const h = /^(#{2,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length as 2 | 3 | 4;
      out.push({ kind: 'heading', level, text: h[2].trim() });
      i++;
      continue;
    }
    // Unordered list.
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push({ kind: 'ul', items });
      continue;
    }
    // Ordered list.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push({ kind: 'ol', items });
      continue;
    }
    // Paragraph: gather until blank line or block boundary.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    out.push({ kind: 'paragraph', text: paraLines.join(' ').trim() });
  }
  return out;
}

function Block({ block }: { block: ParsedBlock }) {
  if (block.kind === 'heading') {
    if (block.level === 2) {
      return (
        <h2 className="font-headline text-[28px] md:text-[32px] font-normal text-maroon mt-12 mb-4 leading-tight">
          {renderInline(block.text)}
        </h2>
      );
    }
    if (block.level === 3) {
      return (
        <h3 className="font-headline text-[22px] md:text-[24px] font-semibold text-maroon mt-8 mb-3 leading-tight">
          {renderInline(block.text)}
        </h3>
      );
    }
    return (
      <h4 className="font-headline text-[18px] font-semibold text-maroon mt-6 mb-2 leading-tight">
        {renderInline(block.text)}
      </h4>
    );
  }
  if (block.kind === 'paragraph') {
    return (
      <p className="text-[16px] text-ink-secondary leading-relaxed mb-4">
        {renderInline(block.text)}
      </p>
    );
  }
  if (block.kind === 'ul') {
    return (
      <ul className="list-disc pl-6 mb-5 space-y-2 text-[16px] text-ink-secondary leading-relaxed">
        {block.items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>
    );
  }
  return (
    <ol className="list-decimal pl-6 mb-5 space-y-2 text-[16px] text-ink-secondary leading-relaxed">
      {block.items.map((it, i) => (
        <li key={i}>{renderInline(it)}</li>
      ))}
    </ol>
  );
}

/**
 * Render inline tokens: links, inline code, bold. Order matters: scan
 * left-to-right, peeling off the first matching pattern.
 */
function renderInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  // Combined regex for inline patterns. Capture groups identify which kind.
  // 1: link text, 2: link href; 3: code; 4: bold
  const re = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) {
      out.push(text.slice(cursor, m.index));
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      const linkText = m[1];
      const href = m[2];
      out.push(<InlineLink key={key++} href={href}>{linkText}</InlineLink>);
    } else if (m[3] !== undefined) {
      out.push(
        <code
          key={key++}
          className="bg-bg-subtle text-ink-primary px-1.5 py-0.5 font-mono text-[13px]"
        >
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-ink-primary">
          {m[4]}
        </strong>,
      );
    }
    cursor = re.lastIndex;
  }
  if (cursor < text.length) {
    out.push(text.slice(cursor));
  }
  return out;
}

function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const isInternal = href.startsWith('/') && !href.startsWith('//');
  if (isInternal) {
    return (
      <Link href={href} className="text-maroon underline hover:text-maroon-deep">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-maroon underline hover:text-maroon-deep"
    >
      {children}
    </a>
  );
}
