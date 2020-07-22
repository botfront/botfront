#!/bin/bash

mkdir -p cypress/output
npx cypress run --spec "cypress/integration/01_initial_setup_dont_change_name/initial_setup.spec.js"

for i in 1 2 3 4 5
do
    mkdir -p cypress/screenshots
    mkdir -p cypress/videos
    npx cypress run --spec "cypress/integration/$SPEC"
    mv cypress/screenshots cypress/output/screenshots_$i
    mv cypress/videos cypress/output/videos_$i
done