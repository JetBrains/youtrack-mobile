#!/bin/bash

set -ex

echo "Cleaning"
rm -rf $2
mkdir $2

# iOS
echo "IOS: Creating source maps..."
react-native bundle \
  --dev false \
  --entry-file index.js \
  --platform ios \
  --sourcemap-output $2/ios-release.bundle.map \
  --bundle-output $2/ios-release.bundle

while [ ! -f $2/ios-release.bundle.map ]; do sleep 1; done
while [ ! -f $2/ios-release.bundle ]; do sleep 1; done

echo "IOS: Source maps created, uploading..."
bugsnag-source-maps upload-react-native \
  --api-key $1 \
  --app-version $3 \
  --platform ios \
  --source-map $2/ios-release.bundle.map \
  --bundle $2/ios-release.bundle
echo "IOS: Source maps uploaded"


# Android

echo "ANDROID: Creating source maps..."
react-native bundle \
  --dev false \
  --entry-file index.js \
  --platform android \
  --sourcemap-output $2/android-release.bundle.map \
  --bundle-output $2/android-release.bundle

while [ ! -f $2/android-release.bundle.map ]; do sleep 1; done
while [ ! -f $2/android-release.bundle ]; do sleep 1; done

echo "ANDROID: Source maps created, uploading..."
bugsnag-source-maps upload-react-native \
  --api-key $1 \
  --app-version $3 \
  --platform android \
  --source-map $2/android-release.bundle.map \
  --bundle $2/android-release.bundle
echo "ANDROID: Source maps uploaded"
