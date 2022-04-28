#!/bin/bash

set -ex

echo "IOS: Creating archive and source maps files..."
export RCT_NO_LAUNCH_PACKAGER=true
xcodebuild archive -allowProvisioningUpdates -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -archivePath ios/build/YouTrackMobile[Release].xcarchive CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED='NO'


echo "IOS: create JS bundle and source maps files..."
CONFIGURATION_BUILD_DIR="$(xcodebuild -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -showBuildSettings | grep CONFIGURATION_BUILD_DIR)"
export CONFIGURATION_BUILD_DIR
echo "IOS: Source map path dir: $(CONFIGURATION_BUILD_DIR)"

cp "$TMPDIR/$(md5 -qs "$CONFIGURATION_BUILD_DIR")-main.jsbundle.map" ios/build/main.jsbundle.map
cp "$CONFIGURATION_BUILD_DIR"/main.jsbundle ios/build/main.jsbundle
