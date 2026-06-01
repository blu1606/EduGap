#!/usr/bin/env python3
"""Validate MCQ option word-count balance for quiz JSON files."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def word_count(value: object) -> int:
    return len(str(value).split())


def iter_json_files(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if path.is_dir():
            files.extend(sorted(path.rglob("*.json")))
        elif path.is_file() and path.suffix.lower() == ".json":
            files.append(path)
        else:
            print(f"WARN: skipped non-json path: {path}", file=sys.stderr)
    return files


def validate_file(path: Path, threshold: float) -> int:
    try:
        quiz = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"FAIL {path}: invalid JSON ({exc})")
        return 1

    questions = quiz.get("questions")
    if not isinstance(questions, list):
        print(f"FAIL {path}: missing questions[]")
        return 1

    failures = 0
    limit = 1 + threshold
    print(f"FILE {path} questions={len(questions)} threshold={threshold:.0%}")

    for question in questions:
        question_id = question.get("id", "?") if isinstance(question, dict) else "?"
        options = question.get("options") if isinstance(question, dict) else None
        answer = question.get("answer") if isinstance(question, dict) else None

        if not isinstance(options, dict):
            print(f"  Q{question_id}: FAIL missing options object")
            failures += 1
            continue

        counts = {key: word_count(options.get(key, "")) for key in ("A", "B", "C", "D")}
        min_words = min(counts.values())
        max_words = max(counts.values())
        ratio = float("inf") if min_words == 0 else max_words / min_words
        status = "OK" if ratio <= limit else "FAIL"

        if status == "FAIL":
            failures += 1

        count_text = " ".join(f"{key}:{counts[key]}" for key in ("A", "B", "C", "D"))
        print(f"  Q{question_id}: {status} ratio={ratio:.2f} answer={answer} {count_text}")

    print(f"SUMMARY {path.name}: failures={failures}\n")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate MCQ option word-count balance.")
    parser.add_argument("paths", nargs="+", type=Path, help="Quiz JSON file(s) or folder(s).")
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.25,
        help="Allowed max word-count gap as decimal. Default: 0.25 for 25%%.",
    )
    args = parser.parse_args()

    files = iter_json_files(args.paths)
    if not files:
        print("FAIL: no JSON files found")
        return 1

    failures = sum(validate_file(path, args.threshold) for path in files)
    if failures:
        print(f"FAILED: {failures} question(s) exceed option balance threshold")
        return 1

    print("PASSED: all questions satisfy option balance threshold")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
