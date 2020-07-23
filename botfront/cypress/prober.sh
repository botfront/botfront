#!/bin/bash

mkdir -p cypress/output
npx cypress run --spec "cypress/integration/01_initial_setup_dont_change_name/initial_setup.spec.js"

for ((i=1; i<=N_REPEATS; i++))
do
    mkdir -p cypress/screenshots
    mkdir -p cypress/videos
    npx cypress run --spec "cypress/integration/$SPEC"
    mv cypress/screenshots cypress/output/screenshots_$i
    mv cypress/videos cypress/output/videos_$i
done