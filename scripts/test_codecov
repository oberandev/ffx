#!/usr/bin/env bash

set -euo pipefail

if [[ $(uname -a) =~ "Darwin" ]]; then
  echo "Downloading macos binary..."
  curl -Os https://uploader.codecov.io/latest/macos/codecov
else
  echo "Downloading linux binary..."
  curl -Os https://uploader.codecov.io/latest/linux/codecov
fi

chmod +x codecov
./codecov