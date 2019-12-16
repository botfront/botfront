#!/bin/bash
set -e

# Wrap docker-compose and return a non-zero exit code if any containers failed.
# https://stackoverflow.com/questions/29568352/using-docker-compose-with-ci-how-to-deal-with-exit-codes-and-daemonized-linked

docker-compose "$@"

exit $(docker-compose ps -q | tr -d '[:space:]' |
        xargs docker inspect -f '{{ .State.ExitCode }}' | grep -v 0 | wc -l | tr -d '[:space:]')