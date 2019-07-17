#!/bin/bash

### Install CLI
cd /workspace/cli
npm install
npm link
cd /workspace

### Run botfront using candidate image
botfront init --ci --path ultimate_test --img-botfront botfront:candidate
sleep 1m

### Connect a cypress container to same network and run
docker run --rm \
  -v /workspace/botfront:/botfront \
  -w /botfront \
  --network="ultimate_test_botfront-network" \
  -e CYPRESS_VIDEO=false \
  -e CYPRESS_MODE="CI_RUN" \
  -e CYPRESS_baseUrl="http://botfront-app:3000" \
  --entrypoint cypress \
  cypress/included:3.4.0 run
