#! /bin/bash

if ! type emulator > /dev/null; then
  echo "`emulator` command not found"
  exit 1
fi

DEVICES=( $(emulator -list-avds 2>&1 ) )

echo "
-------------------
Available Emulators
-------------------"
N=1
EMU=null
for DEVICE in "${DEVICES[@]}"
do
  echo "$N) $DEVICE"
  EMU="$DEVICE"
  let N=$N+1
done

if ((N != null));
then
  echo "Running the last one: ${EMU}"
  emulator "@$EMU" > /dev/null 2>&1 &
  exit 0
else
  read -p "
  Choose an emulator: " num

  if [ $num -lt $N ] && [ $num -gt 0 ];
  then
    DEVICE=${DEVICES[$num-1]}
    emulator "@$DEVICE" > /dev/null 2>&1 &
    exit 0
  else
    echo "Invalid Entry : $num"
    exit 1
  fi
fi
