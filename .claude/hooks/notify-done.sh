#!/usr/bin/env bash
# Desktop notification when Claude Code finishes a task.
# Silent fail if notification tools are unavailable.

MESSAGE="ScoutAI: Claude finished."

if command -v osascript &>/dev/null; then
  osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\"" 2>/dev/null || true
elif command -v notify-send &>/dev/null; then
  notify-send "Claude Code" "$MESSAGE" 2>/dev/null || true
fi

exit 0
