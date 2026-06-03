#!/usr/bin/env python3
"""Validate MCQ and short-answer quiz JSON schema separation."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


MCQ_KEYS = {"options", "answer", "explanation"}
SHORT_ANSWER_KEYS = {"expected_answer", "evaluation_points", "sfia_level", "competency"}
TOP_LEVEL_KEYS = ("id", "parent_id", "topic_title", "title", "description", "questions")


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


def question_kind(question: dict[str, Any]) -> str:
    has_mcq = any(key in question for key in MCQ_KEYS)
    has_short = any(key in question for key in SHORT_ANSWER_KEYS)
    if has_mcq and has_short:
        return "mixed"
    if has_mcq:
        return "mcq"
    if has_short:
        return "short-answer"
    return "unknown"


def validate_top_level(path: Path, quiz: Any) -> int:
    if not isinstance(quiz, dict):
        print(f"FAIL {path}: root must be object")
        return 1

    failures = 0
    for key in TOP_LEVEL_KEYS:
        if key not in quiz:
            print(f"  TOP: FAIL missing {key}")
            failures += 1

    if "questions" in quiz and not isinstance(quiz["questions"], list):
        print("  TOP: FAIL questions must be array")
        failures += 1

    return failures


def validate_mcq(question: dict[str, Any], question_id: object) -> int:
    failures = 0
    options = question.get("options")
    if not isinstance(options, dict):
        print(f"  Q{question_id}: FAIL MCQ missing options object")
        failures += 1
    else:
        option_keys = set(options.keys())
        if option_keys != {"A", "B", "C", "D"}:
            print(f"  Q{question_id}: FAIL MCQ options must be A/B/C/D only")
            failures += 1

    answer = question.get("answer")
    if answer not in {"A", "B", "C", "D"}:
        print(f"  Q{question_id}: FAIL MCQ answer must be A/B/C/D")
        failures += 1

    explanation = question.get("explanation")
    if not isinstance(explanation, str) or not explanation.strip():
        print(f"  Q{question_id}: FAIL MCQ missing explanation")
        failures += 1

    for key in SHORT_ANSWER_KEYS:
        if key in question:
            print(f"  Q{question_id}: FAIL MCQ contains short-answer key {key}")
            failures += 1

    return failures


def validate_short_answer(question: dict[str, Any], question_id: object, max_answer_words: int) -> int:
    failures = 0
    for key in MCQ_KEYS:
        if key in question:
            print(f"  Q{question_id}: FAIL short-answer contains MCQ key {key}")
            failures += 1

    expected_answer = question.get("expected_answer")
    if not isinstance(expected_answer, str) or not expected_answer.strip():
        print(f"  Q{question_id}: FAIL short-answer missing expected_answer")
        failures += 1
    elif word_count(expected_answer) > max_answer_words:
        print(
            f"  Q{question_id}: WARN expected_answer long "
            f"words={word_count(expected_answer)} max={max_answer_words}"
        )

    points = question.get("evaluation_points")
    if not isinstance(points, list) or not 3 <= len(points) <= 5:
        print(f"  Q{question_id}: FAIL evaluation_points must have 3-5 items")
        failures += 1
    elif any(not isinstance(point, str) or not point.strip() for point in points):
        print(f"  Q{question_id}: FAIL evaluation_points must be non-empty strings")
        failures += 1

    for key in ("sfia_level", "competency"):
        if not isinstance(question.get(key), str) or not question.get(key, "").strip():
            print(f"  Q{question_id}: FAIL short-answer missing {key}")
            failures += 1

    return failures


def validate_file(path: Path, max_answer_words: int) -> int:
    try:
        quiz = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"FAIL {path}: invalid JSON ({exc})")
        return 1

    print(f"FILE {path}")
    failures = validate_top_level(path, quiz)
    questions = quiz.get("questions") if isinstance(quiz, dict) else None
    if not isinstance(questions, list):
        print(f"SUMMARY {path.name}: failures={failures}\n")
        return failures or 1

    kinds: set[str] = set()
    for question in questions:
        if not isinstance(question, dict):
            print("  Q?: FAIL question must be object")
            failures += 1
            continue

        question_id = question.get("id", "?")
        if not isinstance(question.get("question"), str) or not question.get("question", "").strip():
            print(f"  Q{question_id}: FAIL missing question text")
            failures += 1

        kind = question_kind(question)
        kinds.add(kind)
        if kind == "mcq":
            failures += validate_mcq(question, question_id)
        elif kind == "short-answer":
            failures += validate_short_answer(question, question_id, max_answer_words)
        elif kind == "mixed":
            print(f"  Q{question_id}: FAIL mixes MCQ and short-answer keys")
            failures += 1
        else:
            print(f"  Q{question_id}: FAIL unknown question schema")
            failures += 1

    clean_kinds = kinds - {"unknown", "mixed"}
    if len(clean_kinds) > 1:
        print("  FILE: FAIL mixes MCQ and short-answer questions")
        failures += 1

    kind_text = ",".join(sorted(kinds)) if kinds else "empty"
    print(f"SUMMARY {path.name}: kind={kind_text} questions={len(questions)} failures={failures}\n")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate MCQ and short-answer quiz JSON schemas.")
    parser.add_argument("paths", nargs="+", type=Path, help="Quiz JSON file(s) or folder(s).")
    parser.add_argument(
        "--max-answer-words",
        type=int,
        default=90,
        help="Warn when short-answer expected_answer exceeds this word count. Default: 90.",
    )
    args = parser.parse_args()

    files = iter_json_files(args.paths)
    if not files:
        print("FAIL: no JSON files found")
        return 1

    failures = sum(validate_file(path, args.max_answer_words) for path in files)
    if failures:
        print(f"FAILED: {failures} schema issue(s)")
        return 1

    print("PASSED: all quiz files satisfy schema separation rules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
