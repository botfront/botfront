#!/usr/bin/env bash

# This script commits files changed or created by post_bump.sh 
# It is intented to be used in the "prerelease" hook of standard-version

git add ../cli/README.md
git add ../CHANGELOG.md 
git add ../cli/project-template/.botfront/botfront.yml 
git commit --amend --no-edit