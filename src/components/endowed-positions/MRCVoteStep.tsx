'use client';

import { useMemo } from 'react';
import { VOTING_MEMBERS, tallyVotes } from '@/lib/endowed-positions/mrc';
import type { MRCVote, VoteChoice } from '@/lib/endowed-positions/types';

type Props = {
  votes: MRCVote[];
  onChange: (next: MRCVote[]) => void;
  /** Shared anonymous comments — one box for the whole council. */
  comments: string;
  onCommentsChange: (next: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

const CHOICES: { value: VoteChoice; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'abstain', label: 'Abstain' },
];

export default function MRCVoteStep({
  votes,
  onChange,
  comments,
  onCommentsChange,
  onBack,
  onContinue,
}: Props) {
  const tally = useMemo(() => tallyVotes(votes), [votes]);

  function setVote(memberId: string, choice: VoteChoice) {
    const existing = votes.find((v) => v.memberId === memberId);
    if (existing) {
      onChange(
        votes.map((v) => (v.memberId === memberId ? { ...v, choice } : v)),
      );
    } else {
      onChange([...votes, { memberId, choice }]);
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
          Each member casts a single ballot on whether the Council concurs with the
          department head&apos;s recommendation: <strong>Yes</strong> (concur),{' '}
          <strong>No</strong> (reject), or <strong>Abstain</strong> (recused). Anonymous
          comments are shared at the bottom of the page and appear after the secret-ballot
          paragraph in the memo.
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
                  {m.rank} &middot; {m.department} &middot; {m.endowedPosition}
                </div>
              </div>
              {v?.choice ? (
                <span className="text-[11px] uppercase tracking-[0.18em] text-status-success font-semibold">
                  Recorded
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
                  className={`px-4 py-2 text-sm border cursor-pointer transition-colors ${
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
                    onChange={() => setVote(m.id, c.value)}
                    className="sr-only"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </section>
        );
      })}

      <section className="card space-y-3">
        <div className="eyebrow text-[11px]">Anonymous comments (shared)</div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          A single shared comment box for the Council. Whatever you write here will appear
          anonymously in the memo for the Dean&apos;s consideration. Leave blank if there are
          no comments.
        </p>
        <textarea
          className="input min-h-[120px] text-sm font-body"
          value={comments}
          placeholder="Optional anonymous comments from the Council, included in the memo."
          onChange={(e) => onCommentsChange(e.target.value)}
        />
      </section>

      <section className="card bg-bg-subtle border-line">
        <div className="eyebrow text-[11px] mb-2">Live tally</div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <Tally label="Yes" value={tally.yes} />
          <Tally label="No" value={tally.no} />
          <Tally label="Abstain" value={tally.abstain} />
        </div>
      </section>

      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="btn-secondary">
          &larr; Back
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
