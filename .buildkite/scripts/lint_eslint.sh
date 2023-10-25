#!/bin/bash

set -euo pipefail

nix-shell --run "nx run-many -t lint"
