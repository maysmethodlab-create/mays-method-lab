'use client';

import { useMemo } from 'react';
import { VOTING_MEMBERS, tallyVotes } from '@/lib/endowed-positions/mrc';
import type { MRCVote, VoteChoice } from '@/lib/endowed-positions/types';

type Props = {
  votes: MRCVote[];
  onChange: (next: MRCVote[]) => void;
  onBack: () => void;
  onContinue: () => void;
};

const CHOICES: { value: VoteChoice; label: string }[] = [
  { value: 'chair', label: 'Chair' },
  { value: 'professorship', label: 'Professorship' },
  { value: 'no-position', label: 'No endowed position' },
];

export default function MRCVoteStep({ votes, onChange, onBack, onContinue }: Props) {
  const tally = useMemo(() => tallyVotes(votes), [votes]);

  function setVote(memberId: string, patch: Partial<MRCVote>) {
    const existing = votes.find((v) => v.memberId === memberId);
    if (existing) {
      onChange(
        votes.map((v) => (v.memberId === memberId ? { ...v, ...patch } : v)),
      );
    } else {
      onChange([...votes, { memberId, ...patch }]);
    }
  }

  const allMembersVoted = VOTING_MEMBERS.every((m) =>
    votes.find((v) => v.memberId === m.id)?.choice,
  );

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <div className="eyebrow text-[11px]">Voting members of the Mays Research Council</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Record each member&apos;s vote on the candidate. Choices match the Boivie example:
          Chair / Professorship / No endowed position. Comments are anonymous to the Dean and
          appear after the secret-ballot paragraph in the memo (only if filled in).
        </p>
      </section>

      {VOTING_MEMBERS.map((m) => {
        const v = votes.find((x) => x.memberId === m.id);
        return (
          <section key={m.id} className="card space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-base font-bold text-ink-primary">{m.name}</div>
                <div className="text-sm text-ink-secondary">
                  {m.rank} · {m.department} · {m.endowedPosition}
                </div>
              </div>
              {v?.choice ? (
                <span className="text-[11px] uppercase tracking-[0.18em] text-status-success font-semibold">
                  ✓ Recorded
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-muted font-semibold">
                  Pending
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className={`px-3 py-2 text-sm border cursor-pointer transition-colors ${
                    v?.choice === c.value
                      ? 'border-maroon bg-maroon text-white'
                      : 'border-line bg-white text-ink-primary hover:border-maroon-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name={`vote-${m.id}`}
                    value={c.value}
                    checked={v?.choice === c.value}
                    onChange={() => setVote(m.id, { choice: c.value })}
                    className="sr-only"
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <label className="block">
              <div className="label">Anonymous comment (optional)</div>
              <textarea
                className="input min-h-[80px] text-sm"
                value={v?.comment || ''}
                placeholder="Comments included anonymously in the memo for the Dean's consideration."
                onChange={(e) => setVote(m.id, { comment: e.target.value })}
              />
            </label>
          </section>
        );
      })}

      <section className="card bg-bg-subtle border-line">
        <div className="eyebrow text-[11px] mb-2">Live tally</div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <Tally label="Chair" value={tally.chair} />
          <Tally label="Professorship" value={tally.professorship} />
          <Tally label="No endowed position" value={tally.noPosition} />
        </div>
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!allMembersVoted}
          className="btn-primary"
        >
          Continue to Generate
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

function Tally({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-white p-3">
      <div className="eyebrow text-[10px] mb-1">{label}</div>
      <div className="text-2xl font-headline text-maroon font-semibold">{value}</div>
    </div>
  );
}
