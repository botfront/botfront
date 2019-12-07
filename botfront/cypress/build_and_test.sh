#!/usr/bin/env bash
docker build -t botfront-local ../../.
docker build -t botfront-api-local ../../.
docker-compose up --abort-on-container-exit --exit-code-from e2e