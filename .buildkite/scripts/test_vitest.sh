#!/bin/bash

set -euo pipefail

if [ "${BUILDKITE_BRANCH}" == "main" ]; then
  nix-shell --run "pnpm nx affected -t test --base=origin/main~1 --head=origin/main --parallel=5"
else
  nix-shell --run "pnpm nx affected -t test --base=origin/main --head=${BUILDKITE_BRANCH} --parallel=5"
fi