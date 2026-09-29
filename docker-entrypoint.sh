#!/bin/sh
set -e

echo "Waiting for database and applying migrations..."
# Retry migrate briefly in case Postgres just became healthy
i=0
until prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge 10 ]; then
    echo "Migration failed after retries."
    exit 1
  fi
  echo "Migration attempt $i failed — retrying in 2s..."
  sleep 2
done

echo "Starting Next.js server..."
exec node server.js
