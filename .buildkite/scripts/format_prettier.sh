#!/usr/bin/env bash

set -euo pipefail

nix-shell --run "pnpm nx run-many -t format:check"
