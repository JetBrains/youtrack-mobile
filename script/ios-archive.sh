#!/bin/bash

set -ex

export RCT_NO_LAUNCH_PACKAGER=true
xcodebuild archive -allowProvisioningUpdates -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -archivePath ios/build/YouTrackMobile[Release].xcarchive CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED='NO'
