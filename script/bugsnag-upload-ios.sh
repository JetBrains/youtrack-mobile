#!/bin/bash

set -ex


echo "IOS: Source maps uploading..."
bugsnag-source-maps upload-react-native \
  --api-key "$1" \
  --app-bundle-version "$2" \
  --platform ios \
  --source-map dist/main.jsbundle.map \
  --bundle dist/main.jsbundle
echo "IOS: Source maps uploaded"
