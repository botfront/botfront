#!/bin/bash

### Install botfront dependencies, run botfront and cypress
meteor npm install
BF_PROJECT_ID=bf \
MONGO_URL=mongodb://mongo:27017/bf \
ORCHESTRATOR=docker-compose \
MODELS_LOCAL_PATH=/app/models \
meteor run &
sleep 3m
npx cypress run
