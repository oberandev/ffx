#!/bin/bash

set -euo pipefail

nix-shell --run "pnpm nx run-many -t lint"
