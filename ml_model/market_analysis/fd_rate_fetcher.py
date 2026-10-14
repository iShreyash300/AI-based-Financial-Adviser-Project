"""
FinAI — Fixed Deposit Rate Fetcher
==================================

Fetches publicly published FD-rate information from official bank websites.
This module does NOT write to PostgreSQL yet; the `bank_data` schema will be
finalised separately.

Supported initial sources:
    SBI, Bank of Baroda, Punjab National Bank, Canara Bank, HDFC Bank,
    ICICI Bank, Axis Bank, Kotak Mahindra Bank, IDFC FIRST Bank,
    AU Small Finance Bank.

Important:
- Only explicitly extracted rates are returned. No rates are guessed.
- Bank websites change their layout; a failed parse is reported per bank.
- Always review `status` and `warnings` before persisting extracted records.
- `fetched_at` means when this script retrieved the page, not when the bank
  made the rate effective. `effective_from` is populated only when found.
- This is a best-effort public-page parser, not a guarantee that every bank's
  full rate card will be automatically parseable on every run.

Dependencies:
    pip install requests beautifulsoup4

Example:
    from fd_rate_fetcher import fetch_all_fd_rates

    result = fetch_all_fd_rates()
    print(result["summary"])
    for record in result["records"]:
        print(record)

CLI:
    python fd_rate_fetcher.py
    python fd_rate_fetcher.py --json fd_rates.json
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

LOGGER = logging.getLogger("finai.fd_rate_fetcher")

REQUEST_TIMEOUT_SECONDS = 25
REQUEST_DELAY_SECONDS = 1.0

USER_AGENT = (
    "FinAI-FDRateFetcher/1.0 "
    "(public financial-rate information; contact: project administrator)"
)

# Official bank pages only. URLs may redirect or change; every result retains
# the final URL actually fetched. If a bank changes its page, update this
# registry rather than substituting an unofficial aggregator.
BANK_SOURCES: list[dict[str, str]] = [
    {
        "bank_name": "State Bank of India",
        "bank_code": "SBI",
        "url": "https://sbi.bank.in/web/interest-rates/deposit-rates/retail-domestic-term-deposits",
    },
    {
        "bank_name": "Bank of Baroda",
        "bank_code": "BOB",
        "url": "https://bankofbaroda.bank.in/interest-rate-and-service-charges/deposits-interest-rates/fixed-deposits-callable-and-non-callable-upto-ten-crores",
    },
    {
        "bank_name": "Punjab National Bank",
        "bank_code": "PNB",
        "url": "https://www.pnbindia.in/Interest-Rates-Deposit.html",
    },
    {
        "bank_name": "Canara Bank",
        "bank_code": "CANARA",
        "url": "https://www.canarabank.bank.in/term-deposits-rate-of-interest-p.a.",
    },
    {
        "bank_name": "HDFC Bank",
        "bank_code": "HDFC",
        "url": "https://www.hdfcbank.com/personal/resources/rates",
    },
    {
        "bank_name": "ICICI Bank",
        "bank_code": "ICICI",
        "url": "https://www.icici.bank.in/personal-banking/deposits/fixed-deposit/fd-interest-rates",
    },
    {
        "bank_name": "Axis Bank",
        "bank_code": "AXIS",
        "url": "https://www.axis.bank.in/deposits/fixed-deposits/fd-interest-rates",
    },
    {
        "bank_name": "Kotak Mahindra Bank",
        "bank_code": "KOTAK",
        # Kotak renders its FD rate table through this official data endpoint.
        # The public landing page's HTML contains the loader, not the rate rows.
        "url": "https://www.kotak.bank.in/bank/mailers/intrates/get_all_variable_data_latest.php?section=NRO_Term_Deposit",
    },
    {
        "bank_name": "IDFC FIRST Bank",
        "bank_code": "IDFC_FIRST",
        "url": "https://www.idfcfirst.bank.in/personal-banking/deposits/fixed-deposit/fd-interest-rates",
    },
    {
        "bank_name": "AU Small Finance Bank",
        "bank_code": "AU_SFB",
        "url": "https://www.au.bank.in/interest-rates/fixed-deposit-interest-rates",
    },
]

# Keep the parser deliberately conservative. It recognises explicit tenure
# text and percentages, but does not infer a missing rate from neighbouring
# rows or calculate rates from promotional claims.
TENURE_RE = re.compile(
    r"(?P<tenure>(?:(?:less than|up to|above|over|more than)\s*)?"
    # Range form also supports banks that put the unit only after the upper bound:
    # e.g. "7 to 29 Days" as well as "7 Days to 29 Days".
    r"\d+\s*(?:(?:days?|months?|years?|yrs?|yr)(?:\s+\d+\s*(?:days?|months?|years?|yrs?|yr))?)?"
    r"\s*(?:to|–|-|—)\s*(?:(?:less than|up to|above|over|more than|<|>)\s*)?"
    r"\d+\s*(?:days?|months?|years?|yrs?|yr)"
    r"(?:\s+\d+\s*(?:days?|months?|years?|yrs?|yr))?"
    r"|(?:(?:less than|up to|above|over|more than)\s*)?"
    r"\d+\s*(?:days?|months?|years?|yrs?|yr)"
    r"(?:\s+\d+\s*(?:days?|months?|years?|yrs?|yr))?"
    r"|7\s*days?\s*to\s*10\s*years?)",
    re.IGNORECASE,
)
PERCENT_RE = re.compile(r"(?<![\w.])(\d{1,2}(?:\.\d{1,4})?)\s*%")
DATE_PATTERNS = [
    re.compile(
        r"(?:effective\s+from|with\s+effect\s+from|w\.e\.f\.|applicable\s+from|"
        r"rates?\s+effective\s+from|last\s+updated)\s*(?:from\s+)?[:\-]?\s*"
        r"(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:effective\s+from|with\s+effect\s+from|applicable\s+from|"
        r"rates?\s+effective\s+from|last\s+updated|w\.e\.f\.)\s*(?:from\s+)?[:\-]?\s*"
        r"(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:effective\s+from|with\s+effect\s+from|applicable\s+from|"
        r"rates?\s+effective\s+from|last\s+updated|w\.e\.f\.)\s*(?:from\s+)?[:\-]?\s*"
        r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})",
        re.IGNORECASE,
    ),
]
SENIOR_TERMS = ("senior citizen", "senior citizens", "senior citizen rate")
GENERAL_TERMS = ("general public", "general public rate", "regular customer", "others")
FD_CONTEXT_TERMS = (
    "fixed deposit",
    "fixed deposits",
    "term deposit",
    "term deposits",
    "domestic term",
    "fd rates",
    "fd interest",
    "deposit rates",
)


@dataclass
class FetchResult:
    bank_name: str
    bank_code: str
    status: str
    requested_url: str
    final_url: Optional[str]
    fetched_at: str
    effective_from: Optional[str]
    records_count: int
    records: list[dict[str, Any]]
    warnings: list[str]
    error: Optional[str] = None


def utc_now_iso() -> str:
    """Return an ISO-8601 UTC timestamp."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def _parse_date(date_text: Optional[str]) -> Optional[str]:
    if not date_text:
        return None
    cleaned = _clean_text(date_text)
    for fmt in (
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y", "%d-%m-%y", "%d.%m.%y",
        "%d %B %Y", "%d %b %Y", "%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y",
    ):
        try:
            parsed = datetime.strptime(cleaned, fmt)
            if parsed.year < 100:
                parsed = parsed.replace(year=2000 + parsed.year)
            return parsed.date().isoformat()
        except ValueError:
            continue
    return None


def _extract_effective_date(text: str) -> Optional[str]:
    # Some bank pages use ordinal dates such as "10th June 2026".
    normalised_text = re.sub(r"\b(\d{1,2})(st|nd|rd|th)\b", r"\1", text or "", flags=re.IGNORECASE)
    for pattern in DATE_PATTERNS:
        match = pattern.search(normalised_text)
        if match:
            parsed = _parse_date(match.group(1))
            if parsed:
                return parsed
    return None


def _normalise_unit(unit: str) -> str:
    unit = unit.lower()
    if unit.startswith("d"):
        return "days"
    if unit.startswith("m"):
        return "months"
    return "years"


def _duration_to_days(number: int, unit: str) -> int:
    unit = _normalise_unit(unit)
    if unit == "days":
        return number
    if unit == "months":
        return number * 30
    return number * 365


def _parse_tenure(text: str) -> Optional[tuple[str, Optional[int], Optional[int]]]:
    """Parse explicit tenure text and estimate its min/max duration in days."""
    value = _clean_text(text)
    # Normalise common bank wording while preserving the actual bounds.
    value = re.sub(r"\s+and above\s+upto\s+and inclusive of\s+", " to ", value, flags=re.IGNORECASE)
    value = re.sub(r"(?<!\w)<\s*", "less than ", value)
    value = re.sub(r"(?<!\w)>\s*", "above ", value)
    value = re.sub(r"\s+and above\s+but less than\s+", " to less than ", value, flags=re.IGNORECASE)
    value = re.sub(r"\s+and above\s+but upto\s+", " to ", value, flags=re.IGNORECASE)
    match = TENURE_RE.search(value)
    if not match:
        return None

    label = _clean_text(match.group("tenure"))
    lower_label = label.lower()
    unit_pattern = r"(\d+)\s*(days?|months?|years?|yrs?|yr)"

    # Treat open-ended phrases conservatively as a bound, not an exact tenure.
    open_match = re.match(
        r"^(less than|up to|above|over|more than|<|>)\s*(\d+)\s*(days?|months?|years?)$",
        lower_label,
    )
    if open_match:
        qualifier, number, unit = open_match.groups()
        bound = _duration_to_days(int(number), unit)
        if qualifier in ("less than", "up to"):
            return label, 1, bound
        return label, bound, None

    # Split ranges before calculating each side so mixed units such as
    # "1 year 1 day to 389 days" are not mistaken for a one-day minimum.
    range_parts = re.split(r"\s+(?:to|–|—|-)\s+", label, maxsplit=1, flags=re.IGNORECASE)
    def side_days(side: str) -> Optional[int]:
        parts = re.findall(unit_pattern, side, flags=re.IGNORECASE)
        if not parts:
            return None
        return sum(_duration_to_days(int(number), unit) for number, unit in parts)

    if len(range_parts) == 2:
        left_text, right_text = range_parts
        left = side_days(left_text)
        right = side_days(right_text)
        # Some bank tables write "7 to 29 Days"; inherit the explicit unit
        # from the other side rather than dropping the row.
        if left is None and right is not None:
            left_number = re.search(r"\d+", left_text)
            right_unit = re.search(r"(?:days?|months?|years?|yrs?|yr)", right_text, re.IGNORECASE)
            if left_number and right_unit:
                left = _duration_to_days(int(left_number.group()), right_unit.group())
        if right is None and left is not None:
            right_number = re.search(r"\d+", right_text)
            left_unit = re.search(r"(?:days?|months?|years?|yrs?|yr)", left_text, re.IGNORECASE)
            if right_number and left_unit:
                right = _duration_to_days(int(right_number.group()), left_unit.group())
        if left is not None and right is not None:
            return label, min(left, right), max(left, right)

    exact = side_days(label)
    if exact is not None:
        return label, exact, exact
    return label, None, None


def _extract_percentages(text: str) -> list[float]:
    values: list[float] = []
    for match in PERCENT_RE.finditer(_clean_text(text)):
        try:
            value = float(match.group(1))
        except ValueError:
            continue
        # A conservative sanity bound for annual deposit interest rates.
        if 0 < value <= 20:
            values.append(value)
    return values


def _extract_rate_cell(text: str) -> Optional[float]:
    """Read one explicit rate cell, including bank tables that omit the % sign."""
    cleaned = _clean_text(text)
    percent_values = _extract_percentages(cleaned)
    if percent_values:
        return percent_values[0]
    # Bare numeric values are accepted only when the caller has identified a
    # column as an interest-rate column. Footnote markers such as 6.75* are OK.
    match = re.fullmatch(r"(\d{1,2}(?:\.\d{1,4})?)\s*[*#†‡]*", cleaned)
    if not match:
        return None
    try:
        value = float(match.group(1))
    except ValueError:
        return None
    return value if 0 < value <= 20 else None


def _is_fd_related(text: str) -> bool:
    lowered = (text or "").lower()
    return any(term in lowered for term in FD_CONTEXT_TERMS)


def _fetch_url(url: str) -> requests.Response:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
    }
    response = requests.get(
        url,
        headers=headers,
        timeout=REQUEST_TIMEOUT_SECONDS,
        allow_redirects=True,
    )
    response.raise_for_status()
    return response


def _get_html_tables(soup: BeautifulSoup) -> list[tuple[list[str], list[list[str]], str]]:
    """Return tables as (combined headers, data rows, surrounding context).

    Handles common multi-row headers and HTML colspan cells without relying on
    a single exact table layout. It intentionally does not execute JavaScript.
    """
    tables: list[tuple[list[str], list[list[str]], str]] = []
    page_title = soup.title.get_text(" ", strip=True) if soup.title else ""
    for table in soup.find_all("table"):
        heading_nodes = table.find_all_previous(["h1", "h2", "h3", "h4", "h5", "h6"])
        nearby_headings = [node.get_text(" ", strip=True) for node in reversed(heading_nodes[:4])]
        context_parts = [
            page_title,
            table.get("aria-label", ""),
            table.get("summary", ""),
            table.get("id", ""),
            " ".join(table.get("class", [])),
            *nearby_headings,
        ]
        context = _clean_text(" ".join(part for part in context_parts if part))

        expanded_rows: list[list[str]] = []
        # Expand colspan/rowspan so grouped headers line up with data columns.
        span_carry: dict[int, list[Any]] = {}  # column -> [text, rows_remaining]
        for tr in table.find_all("tr"):
            values: list[str] = []
            col_index = 0
            for cell in tr.find_all(["th", "td"], recursive=False):
                while col_index in span_carry:
                    span_text, remaining = span_carry[col_index]
                    values.append(span_text)
                    if remaining <= 1:
                        del span_carry[col_index]
                    else:
                        span_carry[col_index][1] = remaining - 1
                    col_index += 1
                text = _clean_text(cell.get_text(" ", strip=True))
                try:
                    colspan = max(1, min(int(cell.get("colspan", 1)), 12))
                    rowspan = max(1, min(int(cell.get("rowspan", 1)), 12))
                except (TypeError, ValueError):
                    colspan, rowspan = 1, 1
                for offset in range(colspan):
                    target_col = col_index + offset
                    values.append(text)
                    if rowspan > 1:
                        span_carry[target_col] = [text, rowspan - 1]
                col_index += colspan
            while col_index in span_carry:
                span_text, remaining = span_carry[col_index]
                values.append(span_text)
                if remaining <= 1:
                    del span_carry[col_index]
                else:
                    span_carry[col_index][1] = remaining - 1
                col_index += 1
            if values:
                expanded_rows.append(values)
        if not expanded_rows:
            continue

        # Find the most informative header row. Some banks place a grouped
        # heading (e.g. "Maturity Periods - Premature Withdrawal Allowed")
        # before the actual Regular/Senior Citizen column headings.
        first_rows = expanded_rows[:6]
        explicit_tenure_rows = [
            i for i, row in enumerate(first_rows)
            if any(token in " ".join(row).lower() for token in ("tenure", "tenors"))
        ]
        maturity_rows = [
            i for i, row in enumerate(first_rows)
            if any(token in " ".join(row).lower() for token in ("maturity period", "maturity periods"))
        ]
        if explicit_tenure_rows:
            header_index = explicit_tenure_rows[-1]
            # Some FD tables put "Tenure" between two grouped headers (for
            # example, premature-withdrawal vs no-premature-withdrawal rates),
            # then put General/Senior Citizen labels on the following row.
            if header_index + 1 < len(first_rows):
                next_text = " ".join(first_rows[header_index + 1]).lower()
                if any(token in next_text for token in ("regular", "senior", "general citizen", "general public")) and not _extract_percentages(next_text):
                    header_index += 1
        elif maturity_rows:
            header_index = maturity_rows[-1]
            # The next row often contains Regular/Senior Citizen subheaders.
            if header_index + 1 < len(first_rows):
                next_text = " ".join(first_rows[header_index + 1]).lower()
                if any(token in next_text for token in ("regular", "senior", "general citizen", "general public")) and not _extract_percentages(next_text):
                    header_index += 1
        else:
            header_index = next(
                (i for i, row in enumerate(first_rows) if "rate" in " ".join(row).lower() or "period" in " ".join(row).lower()),
                0,
            )

        raw_headers = expanded_rows[header_index]
        # Add useful labels from preceding header rows by column position. This
        # supports tables with a group header above General/Senior columns.
        headers: list[str] = []
        for col_index, cell in enumerate(raw_headers):
            pieces: list[str] = []
            for header_row in expanded_rows[:header_index + 1]:
                if col_index < len(header_row):
                    piece = _clean_text(header_row[col_index])
                    if piece and piece.lower() not in [p.lower() for p in pieces]:
                        pieces.append(piece)
            headers.append(" ".join(pieces) if pieces else cell)

        data_rows = expanded_rows[header_index + 1:]
        tables.append((headers, data_rows, context))
    return tables


def _find_column(headers: list[str], keywords: tuple[str, ...]) -> Optional[int]:
    for index, header in enumerate(headers):
        lowered = _clean_text(header).lower()
        if any(keyword in lowered for keyword in keywords):
            return index
    return None


def _extract_kotak_endpoint_records(
    raw_text: str,
    source_url: str,
    fetched_at: str,
) -> tuple[list[dict[str, Any]], Optional[str]]:
    """Parse Kotak's official pipe-delimited document.write() FD rate feed.

    The endpoint returns the table as text embedded in JavaScript rather than
    as ordinary HTML table elements. For retail rates, use the < Rs.3 Crore
    columns: Regular is column 2 and Senior Citizen is column 4 in each data
    row. Larger-deposit slabs are intentionally not mixed into retail rates.
    """
    text = (raw_text or "").replace(r"\n", "\n").replace(r"\r", "\r")
    text = re.sub(r"^\s*document\.write\(\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*\);?\s*$", "", text)
    text = text.strip().strip("\"'")
    text = text.replace(r'\"', '"').replace(r"\'", "'")

    effective_from = _extract_effective_date(text)
    records: list[dict[str, Any]] = []
    source_headers = [
        "Maturity Periods - Premature Withdrawal Allowed",
        "Regular - Less than Rs.3 Crore",
        "Regular - Rs.3 Crore to less than Rs.5 Crore",
        "Senior Citizen - Less than Rs.3 Crore",
        "Senior Citizen - Rs.3 Crore to less than Rs.5 Crore",
    ]

    for line in text.splitlines():
        if "|" not in line:
            continue
        cells = [_clean_text(cell) for cell in line.split("|")]
        # Leading/trailing pipes in the feed create empty cells.
        while cells and not cells[0]:
            cells.pop(0)
        while cells and not cells[-1]:
            cells.pop()
        if len(cells) < 5:
            continue
        tenure = _parse_tenure(cells[0])
        if not tenure:
            continue
        general_rate = _extract_rate_cell(cells[1])
        senior_rate = _extract_rate_cell(cells[3])
        if general_rate is None or senior_rate is None:
            continue

        tenure_label, min_days, max_days = tenure
        record = {
            "bank_name": "Kotak Mahindra Bank",
            "bank_code": "KOTAK",
            "product_type": "fixed_deposit",
            "tenure_label": tenure_label,
            "tenure_min_days": min_days,
            "tenure_max_days": max_days,
            "general_rate": general_rate,
            "senior_citizen_rate": senior_rate,
            "rate_unit": "annual_percent",
            "effective_from": effective_from,
            "source_url": source_url,
            "fetched_at": fetched_at,
            "verified_at": fetched_at,
            "source_table_headers": source_headers,
            "source_row": cells[:5],
        }
        if _validate_record(record):
            records.append(record)

    return records, effective_from


def _extract_records_from_tables(
    bank: dict[str, str],
    tables: list[tuple[list[str], list[list[str]], str]],
    source_url: str,
    fetched_at: str,
    effective_from: Optional[str],
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []

    for headers, rows, context in tables:
        header_text = " ".join(headers)
        combined_context = f"{context} {header_text}"
        # Avoid unrelated loan, savings-account, credit-card, and lending tables.
        if any(word in combined_context.lower() for word in ("home loan", "personal loan", "credit card", "savings account")):
            continue

        tenure_col = _find_column(
            headers, ("tenure", "period", "duration", "term", "maturity")
        )
        general_col = _find_column(
            headers, ("general public", "general", "regular", "others", "non-senior", "public")
        )
        senior_col = _find_column(
            headers, ("senior citizen", "senior citizens", "senior")
        )

        # A table is considered only when its context/header or rows indicate FD
        # and it has an explicit tenure-like column or explicit tenure text.
        table_text = " ".join([" ".join(headers)] + [" ".join(row) for row in rows[:8]])
        header_lower = header_text.lower()
        # Kotak's official interest-rate landing page places the FD rate tables
        # under a general "Interest Rates" page heading, so the table itself may
        # not contain the words "fixed deposit". Accept only its distinctive
        # maturity + Regular + Senior Citizen rate-table structure. Penalty and
        # tax tables are deliberately excluded.
        kotak_fd_rate_table = (
            bank.get("bank_code") == "KOTAK"
            and ("maturity period" in header_lower or "maturity periods" in header_lower)
            and "regular" in header_lower
            and "senior" in header_lower
            and "penalty" not in header_lower
            and "tax rate" not in header_lower
        )
        if not (_is_fd_related(combined_context) or _is_fd_related(table_text) or kotak_fd_rate_table):
            continue

        for row in rows:
            if not row:
                continue
            row_text = " | ".join(row)
            tenure = None
            if tenure_col is not None and tenure_col < len(row):
                tenure = _parse_tenure(row[tenure_col])
            if not tenure:
                # Identify the tenure cell itself rather than parsing the whole
                # row, which could accidentally match an unrelated number.
                for cell in row:
                    tenure = _parse_tenure(cell)
                    if tenure:
                        break
            if not tenure:
                continue

            general_rate: Optional[float] = None
            senior_rate: Optional[float] = None

            if general_col is not None and general_col < len(row):
                value = _extract_rate_cell(row[general_col])
                if value is not None:
                    general_rate = value

            if senior_col is not None and senior_col < len(row):
                value = _extract_rate_cell(row[senior_col])
                if value is not None:
                    senior_rate = value

            # If column labels are ambiguous, do not guess based on position.
            # Only infer a rate when the table explicitly has a rate column.
            if general_rate is None and general_col is None:
                rate_col = _find_column(headers, ("interest rate", "rate of interest", "interest (%)"))
                if rate_col is not None and rate_col < len(row):
                    value = _extract_rate_cell(row[rate_col])
                    if value is not None:
                        # Some banks publish a separate senior-citizen table
                        # with a generic "Interest Rates" column.
                        context_lower = f"{context} {header_text}".lower()
                        if "senior citizen" in context_lower and "general citizen" not in context_lower and "general public" not in context_lower:
                            senior_rate = value
                        else:
                            general_rate = value

            # Senior-only rows may be identifiable by row labels.
            lowered_row = row_text.lower()
            if senior_rate is None and any(term in lowered_row for term in SENIOR_TERMS):
                values = _extract_percentages(row_text)
                if values:
                    senior_rate = values[-1]
            if general_rate is None and any(term in lowered_row for term in GENERAL_TERMS):
                values = _extract_percentages(row_text)
                if values:
                    general_rate = values[-1]

            if general_rate is None and senior_rate is None:
                continue

            tenure_label, min_days, max_days = tenure
            record = {
                "bank_name": bank["bank_name"],
                "bank_code": bank["bank_code"],
                "product_type": "fixed_deposit",
                "tenure_label": tenure_label,
                "tenure_min_days": min_days,
                "tenure_max_days": max_days,
                "general_rate": general_rate,
                "senior_citizen_rate": senior_rate,
                "rate_unit": "annual_percent",
                "effective_from": effective_from,
                "source_url": source_url,
                "fetched_at": fetched_at,
                "verified_at": fetched_at,
                "source_table_headers": headers,
                "source_row": row,
            }
            if _validate_record(record):
                records.append(record)

    # Deduplicate repeated rows while preserving order.
    seen: set[tuple[Any, ...]] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        key = (
            record["tenure_label"].lower(),
            record["general_rate"],
            record["senior_citizen_rate"],
        )
        if key not in seen:
            seen.add(key)
            unique.append(record)
    return unique


def _validate_record(record: dict[str, Any]) -> bool:
    """Reject incomplete or implausible records without repairing them."""
    if not record.get("bank_name") or not record.get("source_url"):
        return False
    if record.get("product_type") != "fixed_deposit":
        return False
    if not record.get("tenure_label"):
        return False

    min_days = record.get("tenure_min_days")
    max_days = record.get("tenure_max_days")
    if min_days is not None and min_days <= 0:
        return False
    if max_days is not None and max_days <= 0:
        return False
    if min_days is not None and max_days is not None and min_days > max_days:
        return False

    general = record.get("general_rate")
    senior = record.get("senior_citizen_rate")
    for rate in (general, senior):
        if rate is not None and not (0 < float(rate) <= 20):
            return False
    if general is None and senior is None:
        return False
    if general is not None and senior is not None and senior + 0.01 < general:
        # Do not reject automatically: some bank products can have exceptions.
        # Preserve the record, but callers should review such cases.
        record.setdefault("validation_warnings", []).append(
            "Senior-citizen rate is lower than the general rate; review source row."
        )
    parsed = urlparse(record["source_url"])
    if parsed.scheme != "https":
        return False
    return True


def fetch_bank_fd_rates(bank: dict[str, str]) -> FetchResult:
    """Fetch and parse one bank's official FD-rate page."""
    fetched_at = utc_now_iso()
    warnings: list[str] = []
    requested_url = bank["url"]

    try:
        response = _fetch_url(requested_url)
        final_url = response.url
        content_type = response.headers.get("Content-Type", "").lower()

        if "html" not in content_type and not response.text.lstrip().startswith(("<!DOCTYPE html", "<html", "<HTML")):
            return FetchResult(
                bank_name=bank["bank_name"],
                bank_code=bank["bank_code"],
                status="no_records",
                requested_url=requested_url,
                final_url=final_url,
                fetched_at=fetched_at,
                effective_from=None,
                records_count=0,
                records=[],
                warnings=["Source did not return an HTML page; only HTML sources are supported."],
            )

        html = response.text
        soup = BeautifulSoup(html, "html.parser")
        page_text = _clean_text(soup.get_text(" ", strip=True))
        effective_from = _extract_effective_date(page_text)

        if bank.get("bank_code") == "KOTAK":
            # Kotak's endpoint wraps pipe-delimited rows in document.write(),
            # so BeautifulSoup table extraction cannot see the actual rates.
            records, effective_from = _extract_kotak_endpoint_records(
                raw_text=html,
                source_url=final_url,
                fetched_at=fetched_at,
            )
            tables = []
        else:
            tables = _get_html_tables(soup)
            records = _extract_records_from_tables(
                bank=bank,
                tables=tables,
                source_url=final_url,
                fetched_at=fetched_at,
                effective_from=effective_from,
            )

        # Detect likely JS-rendered or changed pages rather than reporting
        # a successful fetch when no usable FD records were extracted.
        if not records:
            if not tables:
                warnings.append(
                    "No HTML tables found. The page may require JavaScript "
                    "or a bank-specific HTML parser."
                )
            else:
                warnings.append(
                    "Page loaded, but no rows passed conservative FD tenure/rate "
                    "extraction. Review the page layout before persisting data."
                )
            status = "no_records"
        else:
            status = "success"

        # Preserve extraction provenance and tell the caller if the effective
        # date was not explicitly found on the page.
        if effective_from is None:
            warnings.append(
                "No explicit effective date found; fetched_at is retrieval time only."
            )

        return FetchResult(
            bank_name=bank["bank_name"],
            bank_code=bank["bank_code"],
            status=status,
            requested_url=requested_url,
            final_url=final_url,
            fetched_at=fetched_at,
            effective_from=effective_from,
            records_count=len(records),
            records=records,
            warnings=warnings,
        )

    except requests.RequestException as exc:
        return FetchResult(
            bank_name=bank["bank_name"],
            bank_code=bank["bank_code"],
            status="failed",
            requested_url=requested_url,
            final_url=None,
            fetched_at=fetched_at,
            effective_from=None,
            records_count=0,
            records=[],
            warnings=[],
            error=f"HTTP/network error: {type(exc).__name__}: {exc}",
        )
    except Exception as exc:
        LOGGER.exception("Unexpected error fetching %s", bank["bank_name"])
        return FetchResult(
            bank_name=bank["bank_name"],
            bank_code=bank["bank_code"],
            status="failed",
            requested_url=requested_url,
            final_url=None,
            fetched_at=fetched_at,
            effective_from=None,
            records_count=0,
            records=[],
            warnings=[],
            error=f"Unexpected error: {type(exc).__name__}: {exc}",
        )


def fetch_all_fd_rates(
    banks: Optional[list[dict[str, str]]] = None,
    request_delay_seconds: float = REQUEST_DELAY_SECONDS,
) -> dict[str, Any]:
    """
    Fetch all configured banks sequentially.

    Returns a JSON-serialisable dictionary:
        {
          "fetched_at": "...",
          "summary": {...},
          "results": [per-bank result objects],
          "records": [all extracted rate rows]
        }
    """
    selected_banks = banks if banks is not None else BANK_SOURCES
    run_started_at = utc_now_iso()
    results: list[dict[str, Any]] = []
    all_records: list[dict[str, Any]] = []

    for index, bank in enumerate(selected_banks):
        LOGGER.info("Fetching FD rates: %s (%s)", bank["bank_name"], bank["url"])
        result = fetch_bank_fd_rates(bank)
        result_dict = asdict(result)
        results.append(result_dict)
        all_records.extend(result.records)

        if result.status == "success":
            LOGGER.info("%s: extracted %d records", bank["bank_name"], result.records_count)
        else:
            LOGGER.warning(
                "%s: status=%s, records=%d, error=%s, warnings=%s",
                bank["bank_name"], result.status, result.records_count,
                result.error, result.warnings,
            )

        if index < len(selected_banks) - 1 and request_delay_seconds > 0:
            time.sleep(request_delay_seconds)

    counts = {
        "banks_requested": len(selected_banks),
        "banks_with_records": sum(1 for result in results if result["records_count"] > 0),
        "banks_no_records": sum(1 for result in results if result["status"] == "no_records"),
        "banks_failed": sum(1 for result in results if result["status"] == "failed"),
        "banks_partial": sum(1 for result in results if result["status"] == "partial"),
        "records_extracted": len(all_records),
    }

    return {
        "run_started_at": run_started_at,
        "completed_at": utc_now_iso(),
        "summary": counts,
        "results": results,
        "records": all_records,
    }


def _configure_logging(verbose: bool = False) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch publicly available FD rates from official Indian bank websites."
    )
    parser.add_argument(
        "--json",
        dest="json_path",
        help="Optional path to write the full result as JSON.",
    )
    parser.add_argument(
        "--bank",
        help="Optional bank code to fetch only one bank (e.g. SBI, HDFC, ICICI).",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging.")
    args = parser.parse_args()

    _configure_logging(args.verbose)

    banks = BANK_SOURCES
    if args.bank:
        bank_code = args.bank.strip().upper()
        banks = [bank for bank in BANK_SOURCES if bank["bank_code"] == bank_code]
        if not banks:
            valid = ", ".join(bank["bank_code"] for bank in BANK_SOURCES)
            print(f"Unknown bank code {bank_code!r}. Choose from: {valid}", file=sys.stderr)
            return 2

    output = fetch_all_fd_rates(banks=banks)

    print(json.dumps(output["summary"], indent=2, ensure_ascii=False))
    for result in output["results"]:
        print(
            f'{result["bank_code"]}: {result["status"]}; '
            f'{result["records_count"]} records'
        )
        if result["error"]:
            print(f'  Error: {result["error"]}')
        for warning in result["warnings"]:
            print(f"  Warning: {warning}")

    if args.json_path:
        output_path = Path(args.json_path).expanduser()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(output, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"Full output written to: {output_path.resolve()}")

    # A run may successfully fetch some banks while others fail. Return a
    # non-zero code only when no bank produced any usable records.
    return 0 if output["summary"]["records_extracted"] > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
