#!/usr/bin/env bash
# Deploys one Iris service to an image tag, called by GitHub Actions over SSH:
#   /opt/iris/deploy.sh api <tag>   |   /opt/iris/deploy.sh web <tag>
# Waits for the new container to be healthy and rolls back to the previous tag if it isn't. One deploy at a time.
set -euo pipefail
cd "$(dirname "$0")"
exec 9>/tmp/iris-deploy.lock
flock 9

service="${1:?api or web}"; tag="${2:?image tag}"
case "$service" in
  api) var=IRIS_API_TAG; container=iris_api ;;
  web) var=IRIS_WEB_TAG; container=iris_web ;;
  *) echo "unknown service: $service" >&2; exit 2 ;;
esac

touch .env
previous="$(grep -E "^${var}=" .env | cut -d= -f2- || true)"
set_tag() { grep -vE "^${var}=" .env > .env.tmp || true; echo "${var}=$1" >> .env.tmp; mv .env.tmp .env; }

echo "Deploying $service $tag (previous: ${previous:-none})"
set_tag "$tag"
docker compose pull "$container"
docker compose up -d "$container"

healthy() { [ "$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null)" = healthy ]; }
for _ in $(seq 1 40); do healthy && break; sleep 5; done

if healthy; then
  echo "$service $tag is healthy"
  docker image prune -f >/dev/null
  exit 0
fi

echo "$service $tag did not become healthy; recent logs:" >&2
docker logs --tail 80 "$container" >&2 || true
if [ -n "$previous" ] && [ "$previous" != "$tag" ]; then
  echo "Rolling back to $previous" >&2
  set_tag "$previous"
  docker compose up -d "$container"
fi
exit 1
