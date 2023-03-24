#!/bin/bash

set -ex

VER="$2"
IFS='.'
read -a strarr <<< "$2"

if [ "${strarr[2]}" -eq "0" ]; then
  VER="${strarr[0]}.${strarr[1]}"
fi

echo "ANDROID: Source maps uploading..."
bugsnag-source-maps upload-react-native \
  --api-key "$1" \
  --app-version "$VER" \
  --platform android \
  --source-map dist/index.android.bundle.map \
  --bundle dist/index.android.bundle
echo "ANDROID: Source maps uploaded"
