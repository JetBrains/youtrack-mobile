#!/bin/bash

set -e -x

npm run bugsnag:generate-release-source-map:ios
npm run bugsnag:upload-release-source-map:ios

npm run bugsnag:generate-release-source-map:android
npm run bugsnag:upload-release-source-map:android
