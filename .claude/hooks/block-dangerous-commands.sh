#!/usr/bin/env bash
# Reads tool input JSON from stdin, hard-blocks destructive commands (exit 2).

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

if [ -z "$COMMAND" ]; then
  exit 0
fi

BLOCKED_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \$HOME"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE"
  "alembic downgrade base"
  "alembic downgrade -[0-9]"
  "> /dev/sda"
  "dd if="
  "mkfs"
  "chmod -R 777 /"
)

for PATTERN in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$PATTERN"; then
    echo "BLOCKED: Dangerous command detected — '$PATTERN' matched."
    echo "Command was: $COMMAND"
    exit 2
  fi
done

exit 0
