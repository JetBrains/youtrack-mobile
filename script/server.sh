#!/bin/bash

set -e

ytHome="$(pwd)"

server() {
  paramName=$1
  ytPort="${YT_SERVER_PORT:-8088}"
  ytShutdownPort=$((ytPort + 1))

  case "$paramName" in
  "port")
    echo "$ytPort"
    ;;
  "host")
    ytHost="${YT_SERVER_HOST:-http://127.0.0.1}"
    echo "$ytHost"
    ;;
  "host:port") echo "$(server 'host'):$(server 'port')" ;;

  "jar") echo "$(server 'user.home')/youtrack.jar" ;;
  "teamsysdata.zip") echo "$ytHome/test/teamsysdata.zip" ;;

  "user.home") echo "$ytHome/.tmp" ;;
  "user.home.clear")
    rm -rf "$(server 'user.home')"
    ;;
  "user.home.create")
    mkdir -p "$(server 'user.home')"
    ;;

  "db.home") echo "$(server 'user.home')" ;;
  "db.home.create")
    cp $(server 'teamsysdata.zip') "$(server 'db.home')"
    unzip $(server 'db.home')/teamsysdata.zip -d "$(server 'db.home')"
    ;;

  "download.jar")
    if [[ -z "${DOWNLOAD_URL}" ]]; then
      echo "❌ Error(Server): environment var DOWNLOAD_URL does not exist"
      exit 1
    else
      echo "Downloading JAR from URL ${DOWNLOAD_URL}"
    fi
    wget "${DOWNLOAD_URL}"
    cp youtrack*.jar "$(server 'user.home')/youtrack.jar"
    rm youtrack*.jar
    ;;

  "killProcess")
    kill $( lsof -i:"$(server 'port')" -t )
    ;;

  "start")
    server 'user.home.clear'
    server 'user.home.create'
    server 'db.home.create'
    server 'download.jar'

    ytServerArgs="
      -Xmx1g
      -Ddatabase.location=$(server 'db.home')/teamsysdata
      -Djetbrains.charisma.restoreRootPassword=true
      -Djetbrains.charisma.suckTheTractorDriversDick=true
      -Djetbrains.youtrack.disableBrowser=true
      -Djetbrains.youtrack.baseUrl=$(server 'host:port')
      "

    java $ytServerArgs -jar "$(server 'jar')" "$(server 'port')" &

    # Save pid on java process
    server 'pid' $!

    #===============================================
    echo "-----------------------------------"
    echo "🛠️ pid    => $!"
    echo "🛠️ status => $?"
    echo "-----------------------------------"
    #===============================================

    # Check that server is started
    attempsConnectCount=20
    startConnectTime=$SECONDS
    serverHost="$(server 'host:port')"
    until $(wget -O /dev/null $serverHost); do
      if [ $attempsConnectCount = 0 ]; then
        timeConnect=$((SECONDS - startConnectTime))
        echo "❌ Error(Server): Server has not started after $timeConnect seconds"

        if [ $? -ne 0 ]; then
          echo "❌ Error(Server): Error occurred getting URL $serverHost"
        fi
        if [ $? -eq 6 ]; then
          echo "❌ Error(Server): Unable to resolve host $serverHost"
        fi
        if [ $? -eq 7 ]; then
          echo "❌ Error(Server): Unable to connect to $serverHost"
        fi
        exit 1
      fi

      attempsConnectCount=$((attempsConnectCount - 1))
      sleep 5
    done

    echo "ℹ️ Info(Server): YouTrack has started on $serverHost"
    ;;
  "stop")
    if [ ! "$(netstat -- -ltnp | grep $ytShutdownPort)" ]; then
      exit 0
    fi

    exec 3<>/dev/tcp/0.0.0.0/$ytShutdownPort
    echo -e "youtrack\nstop" >&3
    cat <&3

    server 'user.home.clear'
    ;;
  "pid")
    if [ $# -eq 2 ]; then
      export yt_serverPID=$2
    else
      echo $yt_serverPID
    fi
    ;;
  "status")
    ps -o state -p $(server 'pid')
    ;;
  *)
    echo "Error: Command $1 is not supported!"
    exit 1
    ;;
  esac
}

server $@
