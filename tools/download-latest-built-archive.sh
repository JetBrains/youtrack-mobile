#/bin/bash
set -e

echo "CI server: $1"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

BuildNumber=$(curl $1/guestAuth/app/rest/9.0/builds/?locator=buildType:YouTrack_YouTrackMobile_Develop_BuildNumber,count:1,status:SUCCESS --insecure -H "Accept: application/json" | grep 'number' | grep -o -E '[0-9]+')

echo ">>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<"
echo Build number = $BuildNumber
echo ">>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<"

wget $1/guestAuth/repository/download/YouTrack_YouTrackMobile_Develop_IOS/$BuildNumber/YouTrackMobile[Release].zip -O artifacts.zip

unzip -o artifacts.zip -d ../ios/build/YouTrackMobile[Release].xcarchive

rm -rf artifacts.zip
