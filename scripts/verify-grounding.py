#!/usr/bin/env python3
"""Verifies that relative links in markdown files physically exist on disk."""

import glob
import os
import re
import sys


def check_markdown_file(filepath: str) -> list[str]:
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    # Strip code blocks and inline spans to avoid false positives
    content = re.sub(r"```[\s\S]*?```", "", content)
    content = re.sub(r"`[^`]*`", "", content)

    # Find relative markdown links [text](path)
    links = re.findall(r"\[.*?\]\((?!https?://|mailto:)(.*?)(?:#.*)?\)", content)
    broken = []

    for link in links:
        link = link.strip().split("?")[0]
        if not link or link.startswith("#"):
            continue

        target = os.path.normpath(os.path.join(os.path.dirname(filepath), link))
        if not os.path.exists(target):
            broken.append(f"{filepath} -> {link} (resolved: {target})")

    return broken


def main() -> int:
    files = sys.argv[1:]
    if not files:
        files = [f for f in glob.glob("**/*.md", recursive=True) if "node_modules" not in f]

    broken_links = []
    for f in files:
        if os.path.isfile(f) and f.endswith(".md"):
            broken_links.extend(check_markdown_file(f))

    if broken_links:
        print("Error: Broken relative links detected:", file=sys.stderr)
        for b in broken_links:
            print(f"  - {b}", file=sys.stderr)
        return 1

    print("Codebase grounding check passed: all relative links exist.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
