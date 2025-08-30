import argparse
import json
import re
import unicodedata
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import pdfplumber


# ---------------------------
# Config / constants
# ---------------------------

YEAR_TOKEN_RE = re.compile(r"\b[1-7][A-Z]{1,4}\b", re.IGNORECASE)

# group sub-subjects
SUBJECT_GROUPS = {
    "EDART": {"DESSI", "COMVU", "HISAR", "EDAR1", "EDAR2", "DESGN", "GEODE"},
    "EDMUS": {"HISMU", "THEFO", "CHACH", "PRAIN", "EDMU1", "EDMU2", "THGAM", "CHORA"},
}

PARENT_NAME_OVERRIDES = {
    "EDART": "Éducation artistique",
    "EDMUS": "Éducation musicale",
}


# ---------------------------
# Small helpers
# ---------------------------

def normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def ascii_slug(s: str) -> str:
    nfkd = unicodedata.normalize("NFKD", s or "")
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


def auto_code_from_name(name: str) -> str:
    s = ascii_slug(name).upper()
    s = re.sub(r"[^A-Z ]", " ", s)
    words = [w for w in s.split() if w not in {"DE", "ET", "EN", "DU", "LA", "LE", "DES", "D", "L"}]
    raw = "".join(w[:3] if len(w) <= 4 else w[:4] for w in words) or "SUBJ"
    return (raw[:5] if len(raw) >= 5 else (raw + "X" * (5 - len(raw))))[:6]


def to_int(n: Optional[str]) -> Optional[int]:
    if not n:
        return None
    try:
        return int(round(float(str(n).replace(",", "."))))
    except Exception:
        return None


def year_sort_key(y: str) -> Tuple[int, str]:
    # sort 7..1 then lexicographically
    num = int(y[0]) if y and y[0].isdigit() else 0
    return (10 - num, y)


# ---------------------------
# Core parsing
# ---------------------------

def parse_tables_on_page(page: pdfplumber.page.Page) -> Dict[str, List[Tuple[str, str, Optional[int]]]]:
    """
    Return: {year_code: [(code, name, coeff_or_None), ...]}
    """
    result: Dict[str, List[Tuple[str, str, Optional[int]]]] = {}

    # We only proceed if the page actually contains the Disciplines/Code grid
    text = page.extract_text() or ""
    if "Disciplines" not in text or "Code" not in text:
        return result

    tables = page.find_tables(
        table_settings={
            "vertical_strategy": "lines",
            "horizontal_strategy": "lines",
            "intersection_tolerance": 5,
        }
    ) or []

    for t in tables:
        raw = t.extract()
        if not raw or len(raw) < 4:
            continue

        # Find the header row that contains "Disciplines" and "Code"
        header_row_idx = None
        for i, row in enumerate(raw[:4]):  # header is always very near the top
            row_lower = [str(c or "").lower() for c in row]
            if any("disciplines" in c for c in row_lower) and any("code" in c for c in row_lower):
                header_row_idx = i
                break
        if header_row_idx is None:
            continue

        header = raw[header_row_idx]
        # Map year columns -> year code (e.g., col 3 -> "6CL")
        year_cols: List[Tuple[int, str]] = []
        for j in range(2, len(header)):  # after "Disciplines | Code"
            cell = header[j]
            if not cell:
                continue
            m = YEAR_TOKEN_RE.findall(str(cell))
            if m:
                year_cols.append((j, m[0].upper()))
        if not year_cols:
            continue

        # Data rows start a couple lines after the header row; in practice, the next two
        # rows contain counts + "leç. coeff." labels. We'll skip until we pass them.
        # We'll start from the row after the header row and skip any row that looks like
        # counts/labels, then read until a "Total" row.
        start_idx = header_row_idx + 1

        # Advance past count + "leç. coeff." rows
        while start_idx < len(raw):
            row_text = " ".join(str(c or "") for c in raw[start_idx])
            if "leç" in row_text.lower() and "coeff" in row_text.lower():
                start_idx += 1
                break
            start_idx += 1

        # Iterate data rows
        for row in raw[start_idx:]:
            first_cell = row[0]
            if not first_cell:
                continue

            if isinstance(first_cell, str) and first_cell.strip().lower().startswith("total"):
                break

            name = normalize_ws(first_cell)
            if not name or len(name) < 2:
                continue

            code = normalize_ws(row[1] or "") if len(row) > 1 else ""
            if not code:
                code = auto_code_from_name(name)

            # Assign per-year
            for col_idx, year in year_cols:
                if col_idx >= len(row):
                    continue
                cell = row[col_idx]
                if not cell:
                    # subject not offered for that year-column
                    continue

                # cell looks like "5 4" or "3,5 4" -> last number is coeff
                nums = re.findall(r"(\d+(?:[.,]\d+)?)", str(cell))
                coeff = to_int(nums[-1]) if len(nums) >= 2 else None

                result.setdefault(year, []).append((code, name, coeff))

    return result


def parse_pdf(pdf_path: Path) -> Dict[str, List[Tuple[str, str, Optional[int]]]]:
    """
    Aggregate all tables from all pages into a single map.
    """
    aggregated: Dict[str, List[Tuple[str, str, Optional[int]]]] = {}
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_map = parse_tables_on_page(page)
            for y, items in page_map.items():
                aggregated.setdefault(y, []).extend(items)
    return aggregated


# ---------------------------
# Post-processing
# ---------------------------

def dedupe_and_group(year_map: Dict[str, List[Tuple[str, str, Optional[int]]]]) -> List[Dict]:
    years_out: List[Dict] = []
    for year in sorted(year_map.keys(), key=year_sort_key):
        # de-dupe by code, keep first occurrence
        seen: set = set()
        courses: List[Dict] = []
        for code, name, coeff in year_map[year]:
            if code in seen:
                continue
            seen.add(code)
            item = {"code": code, "name": name}
            if coeff is not None:
                item["coeff"] = coeff
            courses.append(item)

        # group subsubjects under EDART / EDMUS
        by_code = {c["code"]: c for c in courses}
        consumed = set()
        for parent, subs in SUBJECT_GROUPS.items():
            if parent in by_code:
                parent_obj = by_code[parent]
                parent_obj["name"] = PARENT_NAME_OVERRIDES.get(parent, parent_obj["name"])
                parent_obj.setdefault("subsubjects", [])
                for sc in subs:
                    if sc in by_code:
                        parent_obj["subsubjects"].append(
                            {k: v for k, v in by_code[sc].items() if k != "subsubjects"}
                        )
                        consumed.add(sc)

        # Keep original order, drop consumed
        final_courses: List[Dict] = []
        already = set()
        for c in courses:
            if c["code"] in consumed or c["code"] in already:
                continue
            already.add(c["code"])
            final_courses.append(c)

        years_out.append({"year": year, "courses": final_courses})

    return years_out


def build_output(pdf_path: Path, version: str, system: str) -> Dict:
    year_map = parse_pdf(pdf_path)
    years = dedupe_and_group(year_map)
    return {"version": version, "system": system, "years": years}


# ---------------------------
# CLI
# ---------------------------

def main():
    ap = argparse.ArgumentParser(description="Extract ESC classes + coefficients from PDF to classes.json")
    ap.add_argument("--pdf", required=True, help="Path to the ESC PDF (e.g., grille2022_ESC.pdf)")
    ap.add_argument("--out", required=True, help="Output JSON path")
    ap.add_argument("--version", default="2025", help="Version field (default: 2025)")
    ap.add_argument("--system", default="LUX", help="System field (default: LUX)")
    args = ap.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    data = build_output(pdf_path, version=args.version, system=args.system)

    out_path = Path(args.out)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ Wrote {out_path} with {len(data.get('years', []))} year blocks")


if __name__ == "__main__":
    main()
