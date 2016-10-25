#/bin/bash
set -e

echo "CI server: $1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

BuildNumber=$(curl $1/guestAuth/app/rest/9.0/builds/?locator=buildType:YouTrack_YouTrackMobile_70_BuildNumber,count:1,status:SUCCESS --insecure -H "Accept: application/json" | grep 'number' | grep -o -E '[0-9]+')

echo ">>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<"
echo Build number = $BuildNumber
echo ">>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<"

wget $1/guestAuth/repository/download/YouTrack_YouTrackMobile_70_Ios/$BuildNumber/YouTrackMobile[Release].zip -O artifacts.zip

unzip -o artifacts.zip -d ../ios/build/YouTrackMobile[Release].xcarchive

rm -rf artifacts.zip

# Temporary fix for missed archived-expanded-entitlements.xcent file in non-signed archives
# https://youtrack.jetbrains.com/issue/YTM-189
cp ../ios/build/YouTrackMobile\[Release\].xcarchive/Products/Applications/YouTrackMobile.app/YouTrackMobile.entitlements ../ios/build/YouTrackMobile\[Release\].xcarchive/Products/Applications/YouTrackMobile.app/archived-expanded-entitlements.xcent
