#/bin/bash

BuildNumber=$(curl https://buildserver.labs.intellij.net/guestAuth/app/rest/9.0/builds/?locator=buildType:YouTrack_YouTrackMobile_Develop_IOS,count:1,status:SUCCESS  -silent --show-error -H "Accept: application/json" | grep 'number' | grep -o -E '[0-9]+')

echo $BuildNumber
