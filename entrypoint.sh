#!/bin/sh
python3 /app/scripts/api-server.py &
exec node /app/mcp-apps/dist/main.js
