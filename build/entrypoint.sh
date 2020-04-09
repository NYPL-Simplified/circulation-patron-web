#!/bin/bash

# Create blazegraph user
addgroup -S -g $GID web
adduser -S -s /bin/false -G node -u $UID web

# Make sure permissions are good
chown -R web:web /app

su-exec web:web node lib/server/index.js