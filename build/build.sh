#!/bin/sh

set -x

# add some packages
apk add --no-cache bash
apk add --no-cache su-exec

# compile
cp /build/entrypoint.sh /app/entrypoint.sh
cd /app
rm -R /build
