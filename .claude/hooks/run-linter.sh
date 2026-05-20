#!/usr/bin/env bash
# Reads tool input JSON from stdin, extracts file_path, runs the right linter.
# Always exits 0 — never blocks a write.

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

EXT="${FILE##*.}"

case "$EXT" in
  ts|tsx)
    if command -v npx &>/dev/null && [ -f "$(dirname "$FILE")/../../../frontend/package.json" ] || [ -f "frontend/package.json" ]; then
      cd frontend 2>/dev/null || true
      npx eslint --fix "$FILE" 2>/dev/null || true
    fi
    ;;
  py)
    if command -v ruff &>/dev/null; then
      ruff check --fix "$FILE" 2>/dev/null || true
    fi
    ;;
esac

exit 0
