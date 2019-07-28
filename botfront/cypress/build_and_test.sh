#!/usr/bin/env bash
docker build -t botfront-local ../../.
docker build -t gcr.io/botfront-project/cypress-runner:3.4.0 .
docker-compose up --abort-on-container-exit --exit-code-from e2e