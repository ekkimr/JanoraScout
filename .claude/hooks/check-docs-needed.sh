#!/usr/bin/env bash
# Checks if any meaningful source files changed. If yes, reminds Claude to run /doc-updater.
# Filters out migrations, generated files, node_modules, __pycache__.

CHANGED=$(
  { git diff HEAD --name-only 2>/dev/null; git diff --cached --name-only 2>/dev/null; } \
  | sort -u \
  | grep -E '\.(py|ts|tsx)$' \
  | grep -v -E '(migrations/|node_modules/|__pycache__/|\.pyc$|\.d\.ts$|vite-env\.d\.ts)'
)

if [ -n "$CHANGED" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Source files changed — consider running /doc-updater"
  echo "  to keep docs/claude_playbook.md in sync."
  echo ""
  echo "  Changed files:"
  echo "$CHANGED" | sed 's/^/    /'
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

exit 0
