#!/bin/bash
# run-with-retry.sh
#
# Runs send-new-passwords.js and automatically restarts it if it crashes
# (non-zero exit code), relying on sent-log.jsonl for resume so restarts
# don't re-email anyone already sent.
#
# Stops automatically once the script exits successfully (exit code 0).
#
# USAGE:
#   chmod +x run-with-retry.sh
#   nohup ./run-with-retry.sh > run.log 2>&1 &
#
#   Then check progress any time with:
#     tail -f run.log
#     wc -l sent-log.jsonl

MAX_RETRIES=50
RETRY_DELAY_SECONDS=30

attempt=0
while [ $attempt -lt $MAX_RETRIES ]; do
  echo "[$(date)] Starting send-new-passwords.js (attempt $((attempt + 1)))..."
  node send-new-passwords.js --apply
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] Completed successfully. Exiting."
    exit 0
  fi

  attempt=$((attempt + 1))
  echo "[$(date)] Crashed with exit code $EXIT_CODE. Retrying in ${RETRY_DELAY_SECONDS}s... (attempt $attempt/$MAX_RETRIES)"
  sleep $RETRY_DELAY_SECONDS
done

echo "[$(date)] Gave up after $MAX_RETRIES attempts. Check run.log and sent-log.jsonl."
exit 1
