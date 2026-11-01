#!/usr/bin/env bash

set -uo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
RUNNER_DIR="$ROOT/.ai/runner"
REQUEST="$RUNNER_DIR/request"
PROCESSING="$RUNNER_DIR/request.processing"
LOCK_DIR="$RUNNER_DIR/runner.lock"
LATEST_MD="$RUNNER_DIR/latest.md"
LATEST_LOG="$RUNNER_DIR/latest.log"
NODE_SELECTOR="node@24.22.1"
RUN_SEQUENCE=0

mkdir -p -- "$RUNNER_DIR"
cd -- "$ROOT"

if ! command -v mise >/dev/null 2>&1; then
  printf 'Error: mise is required to select Node 24.22.1.\n' >&2
  exit 1
fi

NODE_VERSION="$(mise exec "$NODE_SELECTOR" -- node --version 2>/dev/null)" || {
  printf 'Error: could not start Node 24.22.1 through mise.\n' >&2
  exit 1
}
if [[ "$NODE_VERSION" != "v24.22.1" ]]; then
  printf 'Error: expected Node v24.22.1, got %s.\n' "$NODE_VERSION" >&2
  exit 1
fi

NPM_VERSION="$(mise exec "$NODE_SELECTOR" -- npm --version 2>/dev/null)" || {
  printf 'Error: npm is unavailable under Node 24.22.1.\n' >&2
  exit 1
}

export PLAYWRIGHT_BROWSERS_PATH="$ROOT/.cache/ms-playwright"

if [[ -e "$PROCESSING" ]]; then
  printf 'Error: stale %s exists. Inspect it before starting another runner.\n' "$PROCESSING" >&2
  exit 1
fi
if ! mkdir -- "$LOCK_DIR" 2>/dev/null; then
  printf 'Error: another runner may already be active (lock: %s).\n' "$LOCK_DIR" >&2
  exit 1
fi
printf '%s\n' "$$" > "$LOCK_DIR/pid"

cleanup_runner_lock() {
  rm -f -- "$LOCK_DIR/pid"
  rmdir -- "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup_runner_lock EXIT

printf 'Local validation runner ready.\nProject: %s\nNode: %s\nnpm: %s\nWaiting for %s\n' \
  "$ROOT" "$NODE_VERSION" "$NPM_VERSION" "$REQUEST"

process_request() {
  local started started_epoch finished finished_epoch duration target extra name request_id
  local overall_status=0 exit_code=0
  local -a request_lines=() gate_results=()

  started="$(date '+%Y-%m-%dT%H:%M:%S%z')"
  started_epoch="$(date '+%s')"
  RUN_SEQUENCE=$((RUN_SEQUENCE + 1))
  request_id="${started_epoch}-$$-${RUN_SEQUENCE}"
  mapfile -t request_lines < "$PROCESSING"
  target="${request_lines[0]-}"
  target="${target%$'\r'}"
  extra="${request_lines[1]-}"

  : > "$LATEST_LOG"
  {
    printf '# Local Validation Result\n\n'
    printf 'Request: %s\n' "$target"
    printf 'Request ID: %s\n' "$request_id"
    printf 'Target: %s\n' "$target"
    printf 'Status: RUNNING\n'
    printf 'Started: %s\n' "$started"
    printf 'Node: %s\n' "$NODE_VERSION"
    printf 'npm: %s\n' "$NPM_VERSION"
    printf 'Raw log: `.ai/runner/latest.log`\n'
  } > "$LATEST_MD.tmp"
  mv -f -- "$LATEST_MD.tmp" "$LATEST_MD"
  {
    printf 'Request: %s\nRequest ID: %s\nTarget: %s\nStarted: %s\nNode: %s\nnpm: %s\n' \
      "$target" "$request_id" "$target" "$started" "$NODE_VERSION" "$NPM_VERSION"
  } | tee -a "$LATEST_LOG"

  if [[ "${#request_lines[@]}" -ne 1 || -n "$extra" ]]; then
    printf 'Rejected: request must contain exactly one target line.\n' | tee -a "$LATEST_LOG"
    overall_status=1
  else
    case "$target" in
      static)
        run_static
        ;;
      e2e)
        run_gate 'Playwright E2E' 'npm run test:e2e' mise exec "$NODE_SELECTOR" -- npm run test:e2e
        ;;
      lighthouse)
        run_gate 'Lighthouse audit batch' 'npm run lighthouse' mise exec "$NODE_SELECTOR" -- npm run lighthouse
        ;;
      visual-update)
        run_gate 'Playwright visual baseline update' 'npx playwright test tests/visual-regression.spec.ts --workers=1 --update-snapshots' \
          mise exec "$NODE_SELECTOR" -- npx playwright test tests/visual-regression.spec.ts --workers=1 --update-snapshots
        ;;
      vercel-check)
        # Vercel CLI is a host-authenticated tool, not a project Node/npm command.
        # Run it from the runner's host PATH so mise's Node selection does not
        # hide a CLI installed by the host's package manager.
        run_gate 'Vercel authenticated CLI check' 'vercel whoami' vercel whoami
        ;;
      vercel-preview)
        run_gate 'Vercel preview deployment' 'vercel deploy --yes' vercel deploy --yes
        ;;
      vercel-prod)
        run_gate 'Vercel production deployment' 'vercel deploy --prod --yes' vercel deploy --prod --yes
        ;;
      public-smoke)
        run_gate 'Public deployment smoke' 'node scripts/public-smoke.mjs' mise exec "$NODE_SELECTOR" -- node scripts/public-smoke.mjs
        ;;
      clean-checkout)
        run_gate 'Clean checkout install/test/build/preview' 'node scripts/clean-checkout-smoke.mjs' \
          mise exec "$NODE_SELECTOR" -- node scripts/clean-checkout-smoke.mjs
        ;;
      full)
        run_static
        run_gate 'Playwright E2E' 'npm run test:e2e' mise exec "$NODE_SELECTOR" -- npm run test:e2e
        ;;
      spec:*)
        if [[ "$target" =~ ^spec:([a-zA-Z0-9_-]+)$ ]]; then
          name="${BASH_REMATCH[1]}"
          if [[ -f "$ROOT/tests/$name.spec.ts" ]]; then
            run_gate "Playwright spec:$name" "npx playwright test tests/$name.spec.ts --workers=1" \
              mise exec "$NODE_SELECTOR" -- npx playwright test "tests/$name.spec.ts" --workers=1
          else
            printf 'Rejected: tests/%s.spec.ts does not exist.\n' "$name" | tee -a "$LATEST_LOG"
            overall_status=1
          fi
        else
          printf 'Rejected: unsafe spec target. Allowed characters: letters, digits, underscore, hyphen.\n' | tee -a "$LATEST_LOG"
          overall_status=1
        fi
        ;;
      *)
        printf 'Rejected: unknown target. Allowed targets: static, e2e, full, lighthouse, visual-update, clean-checkout, vercel-check, vercel-preview, vercel-prod, public-smoke, spec:<name>.\n' | tee -a "$LATEST_LOG"
        overall_status=1
        ;;
    esac
  fi

  finished="$(date '+%Y-%m-%dT%H:%M:%S%z')"
  finished_epoch="$(date '+%s')"
  duration=$((finished_epoch - started_epoch))
  if (( overall_status != 0 )); then
    exit_code=1
  fi

  {
    printf '\nFinished: %s\nDuration: %ss\nExit code: %s\n' "$finished" "$duration" "$exit_code"
  } | tee -a "$LATEST_LOG"

  {
    printf '# Local Validation Result\n\n'
    printf 'Request: %s\n' "$target"
    printf 'Request ID: %s\n' "$request_id"
    printf 'Target: %s\n' "$target"
    if (( exit_code == 0 )); then
      printf 'Status: PASS\n'
    else
      printf 'Status: FAIL\n'
    fi
    printf 'Exit code: %s\n' "$exit_code"
    printf 'Started: %s\n' "$started"
    printf 'Finished: %s\n' "$finished"
    printf 'Duration: %ss\n' "$duration"
    printf 'Commands executed:\n'
    if (( ${#gate_results[@]} == 0 )); then
      printf -- '- None (request rejected before execution).\n'
    else
      printf '%s\n' "${gate_results[@]}"
    fi
    printf 'Raw log: `.ai/runner/latest.log`\n'
  } > "$LATEST_MD.tmp"
  mv -f -- "$LATEST_MD.tmp" "$LATEST_MD"

  rm -f -- "$PROCESSING"
}

run_static() {
  run_gate 'Typecheck' 'npm run typecheck' mise exec "$NODE_SELECTOR" -- npm run typecheck
  run_gate 'Lint' 'npm run lint' mise exec "$NODE_SELECTOR" -- npm run lint
  run_gate 'Build' 'npm run build' mise exec "$NODE_SELECTOR" -- npm run build
  run_gate 'Build with mocks' 'VITE_ENABLE_MOCKS=true npm run build' \
    mise exec "$NODE_SELECTOR" -- env VITE_ENABLE_MOCKS=true npm run build
}

run_gate() {
  local label="$1" display_command="$2" command_status
  shift 2

  printf '\n=== %s ===\n$ %s\n' "$label" "$display_command" | tee -a "$LATEST_LOG"
  "$@" 2>&1 | tee -a "$LATEST_LOG"
  command_status="${PIPESTATUS[0]}"
  if (( command_status == 0 )); then
    gate_results+=("- $label: PASS — \`$display_command\`")
    printf '%s: PASS\n' "$label" | tee -a "$LATEST_LOG"
  else
    gate_results+=("- $label: FAIL (exit $command_status) — \`$display_command\`")
    printf '%s: FAIL (exit %s)\n' "$label" "$command_status" | tee -a "$LATEST_LOG"
    overall_status=1
  fi
  return 0
}

while true; do
  if [[ ! -f "$REQUEST" ]]; then
    sleep 1
    continue
  fi

  # Rename on the same filesystem to claim exactly one request before running it.
  if ! mv -- "$REQUEST" "$PROCESSING" 2>/dev/null; then
    sleep 1
    continue
  fi

  process_request
done
