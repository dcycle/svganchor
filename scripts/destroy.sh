#!/bin/bash
set -e

docker kill svg_anchor 2>/dev/null || true
docker rm svg_anchor 2>/dev/null || true

echo 'Environment destroyed.'
