#!/usr/bin/env python3
"""Verify that all relative local href/src links in a static HTML docs directory exist."""
import pathlib
import re
import sys


def main() -> int:
    docs_dir = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "docs").resolve()
    if not docs_dir.is_dir():
        print(f"ERROR: Directory not found: {docs_dir}", file=sys.stderr)
        return 1

    html_files = sorted(docs_dir.rglob("*.html"))
    broken = []
    pattern = re.compile(r'(?:href|src)="([^"]+)"')

    for html_path in html_files:
        text = html_path.read_text(encoding="utf-8")
        for link in pattern.findall(text):
            if link.startswith(("http://", "https://", "mailto:", "#")):
                continue
            clean = link.split("#", 1)[0].split("?", 1)[0]
            if not clean:
                continue
            target = (html_path.parent / clean).resolve()
            if not target.exists():
                broken.append((str(html_path.relative_to(docs_dir)), link))

    print(f"Checked {len(html_files)} HTML files in {docs_dir}")
    if broken:
        print(f"FAIL: {len(broken)} broken local link(s):")
        for src, link in broken:
            print(f"  - {src}: {link}")
        return 1

    print("OK: 0 broken local links.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
