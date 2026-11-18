#!/usr/bin/env python3
"""Scans markdown documentation for forbidden marketing buzzwords, em-dashes, and slop."""

import glob
import os
import re
import sys

FORBIDDEN_BUZZWORDS = [
    r"seamlessly?",
    r"blazingly fast",
    r"cutting-edge",
    r"revolutionary",
    r"comprehensive and robust",
    r"effortlessly?",
]


def check_markdown_file(filepath: str) -> list[str]:
    violations = []
    with open(filepath, encoding="utf-8") as f:
        lines = f.readlines()

    buzzword_pattern = re.compile("|".join(FORBIDDEN_BUZZWORDS), re.IGNORECASE)

    for i, line in enumerate(lines, start=1):
        # Ignore code fences or intentional skill/meta references
        if "```" in line or "Strips meaningless" in line or "Zero Buzzword" in line:
            continue

        if buzzword_pattern.search(line):
            violations.append(f"{filepath}:{i}: Forbidden marketing buzzword detected")

        if "—" in line:
            violations.append(f"{filepath}:{i}: Forbidden long dash (em-dash) detected")

    return violations


def main() -> int:
    files = sys.argv[1:]
    if not files:
        files = [f for f in glob.glob("**/*.md", recursive=True) if "node_modules" not in f]

    all_violations = []
    for f in files:
        if os.path.isfile(f) and f.endswith(".md"):
            all_violations.extend(check_markdown_file(f))

    if all_violations:
        print("Error: Anti-AI-slop violations detected:", file=sys.stderr)
        for v in all_violations:
            print(f"  - {v}", file=sys.stderr)
        return 1

    print("Anti-AI-slop check passed: zero marketing buzzwords and zero em-dashes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
