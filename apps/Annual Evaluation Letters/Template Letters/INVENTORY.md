# Template Letters Inventory

The flat `Template Letters/` directory was replaced by this organized layout
on 2026-05-01. The `scripts/_template-files.mjs` helper resolves any
filename to its location in the new tree, so the existing test scripts and
`src/lib/evaluation-letters/letter-skills.ts` continue to work without
changes to their file lists.

5 department subfolders (one per Mays academic department), each containing
per-individual subfolders. Each individual's folder holds whatever assets
exist for them: the evaluation letter, the Faculty 180 (F180) self-evaluation
report, the CV, and any supporting docs (submission history, etc.).

Multi-person letter packets that originally lived as one Word doc
(e.g. *Associate Annual Review Letters 2025.docx*) have been split: each
individual letter is now extracted as a `_Annual_Review_2025.txt` in the
recipient's folder, while the original bundle is preserved in `_bundles/`
for traceability.

---

## Summary by department

| # | Department | Head | TT | APT | Total |
|---|---|---|---:|---:|---:|
| 1 | Accounting | Sean McGuire | 5 | 3 | 8 |
| 2 | Finance | Jamie Brown | 2 | 2 | 4 |
| 3 | Information & Operations | Rich Metters | 7 | 9 | 16 |
| 4 | Management | Wendy Boswell | 3 | 2 | 5 |
| 5 | Marketing | Keith Wilcox | 0 | 0 | 0 |
|   | **Total** |   | **17** | **16** | **33** |

**Track legend:**
- **TT** = Tenure-track (Assistant / Associate / Full Professor)
- **APT** = Academic Professional Track / non-tenure-track (Lecturer, Senior Lecturer,
  Principal Lecturer, Clinical Professor, Professor of Practice, Executive Professor)

---

## Asset matrix — Accounting (McGuire)

| Name | Rank | Track | Letter | CV | F180 | Other |
|---|---|---|:-:|:-:|:-:|:-:|
| Allen, Natalie | Senior Lecturer | APT | docx + txt | — | — | — |
| Hurta, Amy | Lecturer | APT | docx + txt | pdf | pdf (annual eval) | — |
| Kartapanis, Antonis | Associate Professor | TT | docx + txt | — | — | — |
| Kim, Eunjee | Assistant Professor | TT | docx + txt | pdf | pdf (annual eval) | — |
| Munevar, Kimmie | Assistant Professor | TT | docx + txt | — | — | — |
| Puccia, Jennifer | Assistant Professor | TT | docx + txt | — | — | — |
| Ranzilla, Sam | Executive Professor | APT | docx + txt | — | — | — |
| Stuber, Sarah | Associate Professor | TT | docx + txt | pdf | pdf (annual eval) | — |

## Asset matrix — Finance (Brown)

| Name | Rank | Track | Letter | CV | F180 | Other |
|---|---|---|:-:|:-:|:-:|:-:|
| Amos, Nicole | Asst Dept Head (rank TBD) | APT* | pdf | — | — | — |
| Cziraki, Peter | Assistant Professor | TT | pdf | pdf | pdf (Cziraki, Peter.pdf) | submission history pdf |
| White, Edward | Executive Professor | APT | pdf | — | — | — |
| Wu, Wei | Assoc. Professor of Finance | TT | pdf | pdf | pdf (Wu, Wei.pdf) | submission history pdf |

\* Amos: roster lists "Assistant Department Head" — actual faculty rank should be confirmed from the letter PDF (likely Clinical / Executive). Placed under APT pending verification.

## Asset matrix — Information & Operations (Metters)

| Name | Rank | Track | Letter | CV | F180 | Other |
|---|---|---|:-:|:-:|:-:|:-:|
| Agrawal, Anupam | Associate Professor | TT | txt (extracted) | pdf | pdf | — |
| Arreola-Risa, Antonio | Associate Professor | TT | txt (extracted) | pdf | pdf | — |
| Becker, Aaron | Clinical Professor | APT | txt (extracted) | pdf × 2 | pdf | scholarly-activity pdf, PAR pdf |
| Berberian, Rose | Lecturer | APT | txt (extracted) | — | — | — |
| Boone, Ted | Principal Lecturer | APT | txt (extracted) | — | — | — |
| Curtsinger, Wanda | Senior Lecturer | APT | docx + txt (extracted) | — | pdf | — |
| Gomillion, David | Clinical (rank from F180) | APT | — | — | pdf | PAAR pdf |
| Lee, DJ | Associate Professor | TT | txt (extracted) | — | — | — |
| Phinney, Theresa | Principal Lecturer | APT | txt × 2 parts (extracted) | docx (resume) | pdf | — |
| Rangan, Sudarsan | Clinical Professor | APT | txt (extracted) | pdf | pdf | — |
| Sen, Ravi | Associate Professor | TT | txt (extracted) | — | — | — |
| Stauffer, Jon | Associate Professor | TT | txt (extracted) | — | — | — |
| Stech, Todd | Lecturer | APT | txt (extracted) | — | — | — |
| Whitten, Dwayne | Clinical Professor | APT | txt (extracted) | — | pdf | other-info pdf |
| Zhang, Bin | Associate Professor | TT | txt (extracted) | — | — | — |
| Zhao, Xuying | Associate Professor | TT | txt (extracted) | — | — | — |

## Asset matrix — Management (Boswell)

| Name | Rank | Track | Letter | CV | F180 | Other |
|---|---|---|:-:|:-:|:-:|:-:|
| Boivie, Steve | Professor | TT | docx | — | — | — |
| McFarland, Ken | Clinical Associate Professor | APT | docx | — | — | — |
| Ong, Madeline | Assistant Professor | TT | docx | — | — | — |
| Panina, Daria | Clinical Professor | APT | docx | — | — | — |
| Song, Yifan | Associate Professor | TT | docx | — | — | — |

## Asset matrix — Marketing (Wilcox)

No letters yet.

---

## Coverage notes for the APT project

- **Strongest APT fixtures (have letter + CV/F180):**
  - Hurta, Amy (Accounting / Lecturer)
  - Curtsinger, Wanda (I&O / Senior Lecturer)
  - Phinney, Theresa (I&O / Principal Lecturer)
  - Becker, Aaron (I&O / Clinical Professor)
  - Whitten, Dwayne (I&O / Clinical Professor)
  - Rangan, Sudarsan (I&O / Clinical Professor)
- **APT supporting-docs only (no letter yet):** Gomillion, David (I&O / Clinical) — F180 + PAAR only
- **APT letter-only (no supporting docs):** Allen, Ranzilla, Berberian, Boone,
  Stech, McFarland, Panina, White, Amos
- **APT ranks represented:** Lecturer, Senior Lecturer, Principal Lecturer,
  Clinical Associate Professor, Clinical Professor, Executive Professor
  → All six common APT titles are covered, so the APT letter style can be
  trained against a complete rank ladder.

---

## Bundles preserved

Files in `_bundles/`:
- `Associate Annual Review Letters 2025.docx` + `.txt` — 7 associate-prof letters from Rich Metters (already split into individual folders)
- `lecturer annual review letters 2025.docx` + `.txt` — 6 lecturer letters from Rich Metters (already split)
- `Full Clinical annual review letters 2025.docx` + `.txt` — 3 clinical-faculty letters from Rich Metters (Whitten, Becker, Rangan — all already split into individual folders)
- `senior clinical written comments.docx` + `.txt` — peer-comments compilation for the senior clinical faculty (Becker, Rangan, Whitten)
- `Annual review comments junior clinicals and lecturers.docx` — review comments compilation
- `Annual review comments of associate profs.docx` — review comments compilation

Files in `_templates/`:
- `MKTG Letterhead.docx` — Marketing department letterhead source

---

*Generated 2026-05-01.*
