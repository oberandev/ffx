#!/bin/bash

set -euo pipefail

# curl -Os https://uploader.codecov.io/latest/linux/codecov
# chmod +x codecov
nix-shell --run "pnpm nx affected -t test --base=main --head=HEAD"
# ./codecov