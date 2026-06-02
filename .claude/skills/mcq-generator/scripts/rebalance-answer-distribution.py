#!/usr/bin/env python3
"""Rebalance MCQ answer distribution with randomized answer letters."""

from __future__ import annotations

import argparse
import json
import random
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
    return isinstance(question, dict) and isinstance(question.get("options"), dict) and question.get("answer") in ANSWERS


def balanced_answers(total: int, rng: random.Random) -> list[str]:
    base, remainder = divmod(total, len(ANSWERS))
    answers: list[str] = []
    for index, answer in enumerate(ANSWERS):
        answers.extend([answer] * (base + (1 if index < remainder else 0)))
    rng.shuffle(answers)
    return answers


def swap_correct_option(question: dict[str, Any], target_answer: str) -> None:
    current_answer = question["answer"]
    if current_answer == target_answer:
        return

    options = question["options"]
    current_value = options[current_answer]
    target_value = options[target_answer]
    options[current_answer] = target_value
    options[target_answer] = current_value
    question["answer"] = target_answer


def rebalance_file(path: Path, rng: random.Random, dry_run: bool) -> int:
    try:
        quiz = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"FAIL {path}: invalid JSON ({exc})")
        return 1

    questions = quiz.get("questions") if isinstance(quiz, dict) else None
    if not isinstance(questions, list):
        print(f"SKIP {path}: missing questions[]")
        return 0

    mcq_indexes = [index for index, question in enumerate(questions) if is_mcq(question)]
    if not mcq_indexes:
        print(f"SKIP {path}: no MCQ questions")
        return 0

    targets = balanced_answers(len(mcq_indexes), rng)
    for index, target in zip(mcq_indexes, targets):
        swap_correct_option(questions[index], target)

    counts = Counter(targets)
    count_text = " ".join(f"{answer}:{counts[answer]}" for answer in ANSWERS)
    status = "DRY" if dry_run else "WRITE"
    print(f"{status} {path} mcq={len(mcq_indexes)} {count_text} pattern={''.join(targets)}")

    if not dry_run:
        path.write_text(json.dumps(quiz, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Randomize balanced MCQ answer letters.")
    parser.add_argument("paths", nargs="+", type=Path, help="Quiz JSON file(s) or folder(s).")
    parser.add_argument("--seed", type=int, default=None, help="Seed for reproducible shuffling.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned distribution without writing files.")
    args = parser.parse_args()

    files = iter_json_files(args.paths)
    if not files:
        print("FAIL: no JSON files found")
        return 1

    rng = random.Random(args.seed)
    failures = sum(rebalance_file(path, rng, args.dry_run) for path in files)
    if failures:
        print(f"FAILED: {failures} rebalance issue(s)")
        return 1

    print("PASSED: answer distribution rebalance completed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
