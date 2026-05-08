'use client';

import { useMemo, useState } from 'react';
import {
  deptSlugForWriterId,
  evaluableFacultyByDepartment,
  type FacultyEntry,
} from '@/lib/evaluation-letters/faculty-roster';

type Props = {
  value: string; // current recipient name
  /** Writer (department head) id — used to scope the dropdown to that dept */
  writerId?: string;
  onPick: (entry: FacultyEntry & { departmentSlug: string }) => void;
};

/**
 * Searchable combobox over the evaluable Mays faculty in the writer's own
 * department. Strict scoping: a department head only writes letters for
 * their own faculty, never for someone in another department, and never
 * for a dean (deans' letters are written by the senior associate dean).
 *
 * If no writer is selected upstream, the picker shows an empty state.
 */
export default function FacultyPicker({ value, writerId, onPick }: Props) {
  const allGroups = useMemo(() => evaluableFacultyByDepartment(), []);
  const writerDeptSlug = useMemo(() => deptSlugForWriterId(writerId), [writerId]);
  const writerDept = useMemo(
    () => (writerDeptSlug ? allGroups.find((g) => g.departmentSlug === writerDeptSlug) : null),
    [allGroups, writerDeptSlug],
  );

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!writerDept) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return [writerDept];
    return [
      {
        ...writerDept,
        faculty: writerDept.faculty.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            (f.title || '').toLowerCase().includes(q) ||
            (f.email || '').toLowerCase().includes(q),
        ),
      },
    ].filter((g) => g.faculty.length > 0);
  }, [writerDept, filter]);

  const matchCount = filtered.reduce((n, g) => n + g.faculty.length, 0);
  const deptCount = writerDept ? writerDept.faculty.length : 0;

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
          {writerDept ? (
            <div className="text-[16px] text-ink-muted">
              {deptCount} evaluable faculty in {writerDept.departmentName}. Pick once and we
              fill in name, title, department, role category, and email.
            </div>
          ) : (
            <div className="text-[16px] text-status-warning">
              Choose a writer in the previous step first.
            </div>
          )}
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

      {writerDept && (!value || open) ? (
        <div className="border border-line p-3 bg-bg-subtle">
          <input
            type="text"
            autoFocus
            placeholder={`Type a name, title, or email in ${writerDept.departmentName}…`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input mb-3"
          />
          <div className="text-[16px] text-ink-muted mb-2">
            {matchCount} match{matchCount === 1 ? '' : 'es'} in {writerDept.departmentName}
          </div>
          <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
            {filtered.map((g) => (
              <div key={g.departmentSlug}>
                <div className="text-[16px] uppercase tracking-[0.18em] text-maroon font-bold border-b border-line pb-1 mb-1">
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
                          <span className="text-[16px] text-ink-muted ml-auto">{f.email}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {matchCount === 0 ? (
              <div className="text-sm text-ink-muted px-2 py-6 text-center">
                No faculty in {writerDept.departmentName} match &quot;{filter}&quot;.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
