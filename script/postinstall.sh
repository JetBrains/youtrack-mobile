#!/bin/bash

set -e -x

echo "Running JETIFIER"
npx jetifier

echo "Running IOS-INSTALL-THIRD-PARTY"
cd node_modules/react-native/React/..; exec ./scripts/ios-install-third-party.sh
