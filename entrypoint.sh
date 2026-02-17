#!/bin/sh

# Auto-generate yahoo_oauth.json from env vars if the file doesn't exist.
# The yahoo-oauth library reads credentials from this file and writes
# refreshed tokens back to it, so it must remain a writable file on disk.
OAUTH_FILE="${OAUTH_FILE:-/app/config/yahoo_oauth.json}"

if [ ! -f "$OAUTH_FILE" ]; then
  if [ -n "$YAHOO_CONSUMER_KEY" ] && [ -n "$YAHOO_CONSUMER_SECRET" ]; then
    echo "Generating $OAUTH_FILE from YAHOO_CONSUMER_KEY/YAHOO_CONSUMER_SECRET env vars"
    cat > "$OAUTH_FILE" <<EOF
{
    "consumer_key": "$YAHOO_CONSUMER_KEY",
    "consumer_secret": "$YAHOO_CONSUMER_SECRET"
}
EOF
  else
    echo "WARNING: $OAUTH_FILE not found and YAHOO_CONSUMER_KEY/YAHOO_CONSUMER_SECRET not set."
    echo "Yahoo API calls will fail until credentials are configured."
  fi
fi

python3 /app/scripts/api-server.py &
exec node /app/mcp-apps/dist/main.js
