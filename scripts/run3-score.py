"""Score the 12 responses against the 9-point rubric."""
import json
import re
import sys

SOURCE_PATH = "data/sources/mays-faculty-guidelines.txt"
RAW_PATH = "docs/v3-tester-run3-raw-responses.jsonl"

def normalize(s):
    """Match the relaxed normalization the Fixer added."""
    if not s:
        return ""
    # Smart quotes -> straight
    s = s.replace("‘", "'").replace("’", "'")
    s = s.replace("“", '"').replace("”", '"')
    # Dash variants
    s = s.replace("—", "-").replace("–", "-").replace("−", "-")
    # NBSPs and other whitespace
    s = s.replace(" ", " ").replace(" ", " ").replace(" ", " ")
    # Lowercase
    s = s.lower()
    # Collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s

def extract_quotes(text):
    """Pull out anything in straight or smart double quotes >= 15 chars."""
    quotes = []
    # Straight double
    for m in re.finditer(r'"([^"]{15,})"', text):
        quotes.append(m.group(1))
    # Smart double
    for m in re.finditer(r'“([^”]{15,})”', text):
        quotes.append(m.group(1))
    return quotes

def has_em_dash(text):
    return "—" in text

def has_stranded_hyphen(text):
    """Look for hyphens flanked by spaces (e.g., 'word - word')."""
    return bool(re.search(r"\s-\s", text))

def has_page_ref(text):
    """Check for p. X or p.X pattern, or 'page X'."""
    return bool(re.search(r"p\.\s?\d+|page\s+\d+", text, re.IGNORECASE))

def has_section_or_appendix(text):
    return bool(re.search(r"section|appendix|chapter|article|page", text, re.IGNORECASE))

def has_personal_template(text):
    """Personal-applicability 4-part template signature."""
    # Look for 4 sections — common labels include "What the guidelines say", "Quote", "Limitations", "Action"
    lower = text.lower()
    indicators = [
        ("what the guidelines say" in lower or "what the document says" in lower or "what the guidelines state" in lower or "what the document states" in lower),
        ("quote:" in lower or "verbatim" in lower or '"' in text or "“" in text),
        ("limitations" in lower or "limitation:" in lower or "this is not" in lower or "cannot determine" in lower or "do not specify" in lower),
        ("action" in lower or "next step" in lower or "contact" in lower or "department head" in lower or "ssridhar" in lower),
    ]
    return sum(indicators) >= 3

def has_source_footer(text):
    lower = text.lower()
    return ("mays faculty guidelines" in lower) and ("october" in lower or "2025" in lower or "approved" in lower)

def has_clean_refusal(text, kind):
    lower = text.lower()
    if kind == "offtopic":
        return ("not address" in lower or "do not address" in lower or "outside" in lower or "not covered" in lower or "do not contain" in lower)
    if kind == "injection":
        return ("not address" in lower or "do not address" in lower or "outside" in lower or "do not contain" in lower or "cannot" in lower)
    return False

def main():
    with open(SOURCE_PATH, "r", encoding="utf-8") as f:
        source = f.read()
    source_norm = normalize(source)

    with open(RAW_PATH, "r", encoding="utf-8") as f:
        records = [json.loads(line) for line in f if line.strip()]

    rows = []
    for rec in records:
        n = rec["n"]
        msg = rec["message"]
        category = "A" if n <= 3 else "B" if n <= 6 else "C" if n <= 10 else ("D" if n == 11 else "E")

        quotes = extract_quotes(msg)
        # Score each criterion
        # 1. Verbatim citation present (skip refusals)
        is_refusal = (n in (11, 12)) or ("do not address" in msg.lower() and len(msg) < 300)
        c1 = "Yes" if quotes else ("N/A" if is_refusal else "No")

        # 2. Section or page reference
        c2 = "Yes" if (has_page_ref(msg) or has_section_or_appendix(msg)) else "No"

        # 3. Personal-applicability template (Cat C only must be Yes)
        if category == "C":
            c3 = "Yes" if has_personal_template(msg) else "No"
        else:
            c3 = "Yes" if not has_personal_template(msg) else "No (forbidden)"

        # 4. Forbidden phrasing absent (no first-person "I" claims of authority, no "you should")
        forbidden_patterns = [
            r"\bi (think|believe|recommend|suggest)\b",
            r"\byou should\b",
            r"\byou will\b(?! get tenure)",
        ]
        forb_hits = []
        for pat in forbidden_patterns:
            if re.search(pat, msg, re.IGNORECASE):
                forb_hits.append(pat)
        c4 = "Yes" if not forb_hits else f"No ({forb_hits})"

        # 5. Source footer present
        c5 = "Yes" if has_source_footer(msg) else "No"

        # 6. Off-topic / injection refusal clean
        if category == "D":
            c6 = "Yes" if has_clean_refusal(msg, "offtopic") else "No"
        elif category == "E":
            c6 = "Yes" if has_clean_refusal(msg, "injection") else "No"
        else:
            c6 = "N/A"

        # 7. No fabricated quotes
        fab = []
        for q in quotes:
            qn = normalize(q)
            if qn and qn not in source_norm:
                fab.append(q)
        c7 = "Yes" if not fab else f"No ({len(fab)} fabricated)"

        # 8. No em dashes / stranded hyphens
        em = has_em_dash(msg)
        sh = has_stranded_hyphen(msg)
        c8 = "Yes" if not em and not sh else f"No (em={em}, stranded={sh})"

        # 9. Substantive content recovered (Q1, Q3, Q7)
        if n in (1, 3, 7):
            # need at least one genuine quote (passes c7 with quote present)
            has_genuine = bool(quotes) and not fab
            c9 = "Yes" if has_genuine else "No"
        else:
            c9 = "N/A"

        rows.append({
            "n": n,
            "category": category,
            "question": rec["question"],
            "message": msg,
            "quotes": quotes,
            "fabricated": fab,
            "c1": c1, "c2": c2, "c3": c3, "c4": c4, "c5": c5, "c6": c6, "c7": c7, "c8": c8, "c9": c9,
            "em_dash": em,
            "stranded_hyphen": sh,
        })

    # Aggregate pass-bar checks
    # Pass bar 1
    q10 = next(r for r in rows if r["n"] == 10)
    pb1_q10 = len(q10["fabricated"]) == 0
    q6 = next(r for r in rows if r["n"] == 6)
    pb1_q6 = not has_personal_template(q6["message"])
    pb1_em = all(not r["em_dash"] for r in rows)
    # Page numbers: every section/appendix citation has p. X
    pb1_pages = True
    page_failures = []
    for r in rows:
        m = r["message"].lower()
        if re.search(r"section|appendix", m):
            if not has_page_ref(m):
                pb1_pages = False
                page_failures.append(r["n"])
    pb1 = pb1_q10 and pb1_q6 and pb1_em and pb1_pages

    # Pass bar 2: regressions
    q1 = next(r for r in rows if r["n"] == 1)
    pb2_q1 = bool(q1["quotes"]) and not q1["fabricated"]
    q3 = next(r for r in rows if r["n"] == 3)
    pb2_q3 = bool(q3["quotes"]) and not q3["fabricated"]
    q7 = next(r for r in rows if r["n"] == 7)
    pb2_q7 = bool(q7["quotes"]) and not q7["fabricated"]
    pb2 = pb2_q1 and pb2_q3 and pb2_q7

    # Pass bar 3: personal applicability triggers correctly
    pb3_failures = []
    for n in (7, 8, 9, 10):
        r = next(rr for rr in rows if rr["n"] == n)
        if not has_personal_template(r["message"]):
            pb3_failures.append(n)
    pb3 = not pb3_failures

    summary = {
        "pb1": pb1, "pb1_q10": pb1_q10, "pb1_q6": pb1_q6, "pb1_em": pb1_em, "pb1_pages": pb1_pages, "page_failures": page_failures,
        "pb2": pb2, "pb2_q1": pb2_q1, "pb2_q3": pb2_q3, "pb2_q7": pb2_q7,
        "pb3": pb3, "pb3_failures": pb3_failures,
    }

    print(json.dumps(summary, indent=2))
    print("---ROWS---")
    for r in rows:
        print(json.dumps({k: v for k, v in r.items() if k != "message"}, indent=2))
        print("MSG:", r["message"][:500])
        print()

    # Save
    with open("docs/v3-tester-run3-scores.json", "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "rows": rows}, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
