#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.development"
OP_ENVIRONMENT_ID="ca6uypwvab5mevel44gqdc2zae"

args=()
for arg in "$@"; do
  case "$arg" in
    --staging)    ENV_FILE=".env.staging" ;;
    --production) ENV_FILE=".env.production" ;;
    --)          ;;
    *)           args+=("$arg") ;;
  esac
done
set -- "${args[@]}"

if [ $# -eq 0 ]; then
  echo "Usage: env.sh [--staging|--production] <command...>"
  exit 1
fi

OP_ENVIRONMENT_ID="${OP_ENVIRONMENT_ID:?Set OP_ENVIRONMENT_ID or update this script with your 1Password Environment ID}"

exec op run --environment "$OP_ENVIRONMENT_ID" -- dotenvx run -f "$ENV_FILE" -- "$@"
