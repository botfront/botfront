#!/usr/bin/env bash
CONFIG=config=../../cli/project-template/.botfront/botfront.yml

# docker build -t botfront-local ../../.
# docker build -t botfront-api-local ../../api/.
RASA_TAG=$(sed -n 's/\S*rasa: \(.*\)$/\1/p' $config | sed 's/.*://') docker-compose up --abort-on-container-exit --exit-code-from e2e
