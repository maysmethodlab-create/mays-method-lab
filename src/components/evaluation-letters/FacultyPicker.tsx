'use client';

import { useMemo, useState } from 'react';
import {
  evaluableFacultyByDepartment,
  type FacultyEntry,
} from '@/lib/evaluation-letters/faculty-roster';

type Props = {
  value: string; // current recipient name
  onPick: (entry: FacultyEntry & { departmentSlug: string }) => void;
};

/**
 * Searchable combobox over the 215 evaluable Mays faculty across the 5
 * academic departments. Pick once and the parent fills in name, title,
 * department, role-category, and email.
 */
export default function FacultyPicker({ value, onPick }: Props) {
  const groups = useMemo(() => evaluableFacultyByDepartment(), []);
  const totalCount = useMemo(
    () => groups.reduce((n, g) => n + g.faculty.length, 0),
    [groups],
  );

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        faculty: g.faculty.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            (f.title || '').toLowerCase().includes(q) ||
            (f.email || '').toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.faculty.length > 0);
  }, [groups, filter]);

  const matchCount = filtered.reduce((n, g) => n + g.faculty.length, 0);

  function handlePick(entry: FacultyEntry, departmentSlug: string) {
    onPick({ ...entry, departmentSlug });
    setOpen(false);
    setFilter('');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="label">Faculty</div>
          <div className="text-[11px] text-ink-muted">
            {totalCount} faculty across the 5 academic departments at Mays. Pick once and we
            fill in name, title, department, role category, and email.
          </div>
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs uppercase tracking-[0.15em] font-semibold text-maroon hover:text-maroon-deep transition-colors"
          >
            {open ? 'Cancel' : 'Change recipient'}
          </button>
        ) : null}
      </div>

      {!value || open ? (
        <div className="border border-line rounded-card p-3 bg-bg-subtle">
          <input
            type="text"
            autoFocus
            placeholder="Type a name, title, or email…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input mb-3"
          />
          <div className="text-[11px] text-ink-muted mb-2">
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </div>
          <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
            {filtered.map((g) => (
              <div key={g.departmentSlug}>
                <div className="text-[10px] uppercase tracking-[0.18em] text-maroon font-bold border-b border-line pb-1 mb-1">
                  {g.departmentName}
                </div>
                <ul className="divide-y divide-line">
                  {g.faculty.map((f) => (
                    <li key={f.profileUrl}>
                      <button
                        type="button"
                        onClick={() => handlePick(f, g.departmentSlug)}
                        className="w-full text-left px-2 py-2 hover:bg-white transition-colors flex items-baseline gap-3 flex-wrap"
                      >
                        <span className="font-semibold text-ink-primary text-sm">{f.name}</span>
                        <span className="text-xs text-ink-secondary">{f.title || '—'}</span>
                        {f.email ? (
                          <span className="text-[11px] text-ink-muted ml-auto">{f.email}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {matchCount === 0 ? (
              <div className="text-sm text-ink-muted px-2 py-6 text-center">
                No faculty match &quot;{filter}&quot;. The recipient might still be in the
                directory under a slightly different name &mdash; try a partial match.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
