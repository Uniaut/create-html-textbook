"""Run input/output checks against a compiled grid exercise."""
import pathlib
import subprocess
import sys

cases = [
    ("1 1\n.\n", "0"),
    ("2 2\n.#\n#.\n", "-1"),
    ("3 4\n....\n###.\n....\n", "5"),
    ("3 3\n...\n...\n...\n", "4"),
]

binary = pathlib.Path(sys.argv[1]).resolve()
failures = 0
for index, (input_text, expected) in enumerate(cases, 1):
    result = subprocess.run([binary], input=input_text, text=True, capture_output=True, timeout=2)
    actual = result.stdout.strip()
    passed = result.returncode == 0 and actual == expected
    failures += not passed
    print(f"{index}: {'PASS' if passed else 'FAIL'} (expected {expected}, got {actual!r})")
sys.exit(bool(failures))
