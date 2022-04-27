#!/bin/bash

set -ex


echo "ANDROID: Source maps uploading..."
bugsnag-source-maps upload-react-native \
  --api-key "$1" \
  --app-version "$2" \
  --platform android \
  --source-map dist/index.android.bundle.map \
  --bundle dist/index.android.bundle
echo "ANDROID: Source maps uploaded"
