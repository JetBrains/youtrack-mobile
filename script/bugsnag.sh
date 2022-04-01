#!/bin/bash

set -ex


# Android

echo "ANDROID: Generated source maps"
ls android/app/build/generated/sourcemaps/react/release

echo "ANDROID: Source maps uploading..."
bugsnag-source-maps upload-react-native \
  --api-key "$1" \
  --app-version "$3" \
  --platform android \
  --source-map android/app/build/generated/sourcemaps/react/release/index.android.bundle.map \
  --bundle android/app/build/generated/assets/react/release/index.android.bundle
echo "ANDROID: Source maps uploaded"


# iOS

echo "IOS: Creating source maps..."
xcdbuild=$(which xcodebuild)
export CONFIGURATION_BUILD_DIR="$($xcdbuild -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -showBuildSettings | grep CONFIGURATION_BUILD_DIR)"
echo "IOS: Source map path is $(CONFIGURATION_BUILD_DIR)"

echo "IOS: Source maps uploading..."
bugsnag-source-maps upload-react-native \
  --api-key "$1" \
  --app-version "$3" \
  --platform ios \
  --source-map "$TMPDIR"/"$(md5 -qs "$CONFIGURATION_BUILD_DIR")"-main.jsbundle.map \
  --bundle "$CONFIGURATION_BUILD_DIR"/main.jsbundle
echo "IOS: Source maps uploaded"
