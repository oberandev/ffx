#!/bin/bash

set -euo pipefail

curl -Os https://uploader.codecov.io/latest/linux/codecov
chmod +x codecov
./codecov