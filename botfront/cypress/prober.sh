#!/usr/bin/env bash

mkdir cypress/output
npx cypress run --spec "cypress/integration/01_initial_setup_dont_change_name/initial_setup.spec.js"
for i in {1..5}
do
    npx cypress run --record --spec "cypress/integration/$SPEC"
    mv cypress/screenshots cypress/ouput/screenshots_$i
    mv cypress/videos cypress/ouput/videos_$i
done