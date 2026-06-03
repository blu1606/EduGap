#!/usr/bin/env python3
"""Validate MCQ answer distribution for quiz JSON files."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ANSWERS = ("A", "B", "C", "D")


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


def is_mcq(question: Any) -> bool:
    return isinstance(question, dict) and isinstance(question.get("options"), dict) and "answer" in question


def validate_file(path: Path, max_share: float, min_questions: int) -> int:
    try:
        quiz = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"FAIL {path}: invalid JSON ({exc})")
        return 1

    questions = quiz.get("questions") if isinstance(quiz, dict) else None
    if not isinstance(questions, list):
        print(f"SKIP {path}: missing questions[]")
        return 0

    mcq_questions = [question for question in questions if is_mcq(question)]
    if not mcq_questions:
        print(f"SKIP {path}: no MCQ questions")
        return 0

    failures = 0
    counts: Counter[str] = Counter()
    invalid_answers = 0
    for question in mcq_questions:
        answer = question.get("answer")
        if answer in ANSWERS:
            counts[answer] += 1
        else:
            invalid_answers += 1

    total = len(mcq_questions)
    count_text = " ".join(f"{answer}:{counts[answer]}" for answer in ANSWERS)
    dominant_answer, dominant_count = max(((answer, counts[answer]) for answer in ANSWERS), key=lambda item: item[1])
    dominant_share = dominant_count / total if total else 0

    print(
        f"FILE {path} mcq={total} max_share={max_share:.0%} "
        f"dominant={dominant_answer}:{dominant_share:.0%} {count_text}"
    )

    if invalid_answers:
        print(f"  FAIL invalid answer count={invalid_answers}")
        failures += invalid_answers

    if total >= min_questions and dominant_share > max_share:
        print(
            f"  FAIL answer {dominant_answer} appears {dominant_count}/{total} "
            f"({dominant_share:.0%}), over {max_share:.0%}"
        )
        failures += 1
    elif total < min_questions:
        print(f"  WARN skipped distribution gate: mcq={total} below min_questions={min_questions}")

    print(f"SUMMARY {path.name}: failures={failures}\n")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate MCQ answer distribution.")
    parser.add_argument("paths", nargs="+", type=Path, help="Quiz JSON file(s) or folder(s).")
    parser.add_argument(
        "--max-share",
        type=float,
        default=0.40,
        help="Max allowed share for one answer letter. Default: 0.40 for 40%%.",
    )
    parser.add_argument(
        "--min-questions",
        type=int,
        default=5,
        help="Only enforce distribution for files with at least this many MCQ questions. Default: 5.",
    )
    args = parser.parse_args()

    files = iter_json_files(args.paths)
    if not files:
        print("FAIL: no JSON files found")
        return 1

    failures = sum(validate_file(path, args.max_share, args.min_questions) for path in files)
    if failures:
        print(f"FAILED: {failures} answer distribution issue(s)")
        return 1

    print("PASSED: all MCQ answer distributions satisfy threshold")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
