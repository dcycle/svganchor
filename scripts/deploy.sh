#!/bin/bash
set -e

docker run --rm -d --name svg_anchor -p 8085:80 -v "$PWD":/usr/local/apache2/htdocs/ httpd:2.4

echo ""
echo "See the site at http://0.0.0.0:8085"
echo ""
echo "Use ./scripts/destroy.sh to stop the local environment."
echo ""
