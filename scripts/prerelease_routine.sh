#!/usr/bin/env bash

# This script takes the version from botfront/package.json and copies it to cli/package.json and cli/package-lock.json
# It is intented to be used in the "prerelease" hook of standard-version

PACKAGE_VERSION=$(cat ../botfront/package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

function set_version {
	search='("version":[[:space:]]*").+(")'
	replace="\1${2}\2"
	sed -i ".tmp" -E "s/${search}/${replace}/g" "$1"
	rm "$1.tmp"
}

set_version "../cli/package.json" $PACKAGE_VERSION
echo "Version $PACKAGE_VERSION set in cli/package.json"
set_version "../cli/package-lock.json" $PACKAGE_VERSION
echo "Version $PACKAGE_VERSION set in cli/package-lock.json"