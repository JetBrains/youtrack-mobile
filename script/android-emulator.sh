EMULATORS="$($(which emulator) -list-avds)"

printf "Existing emulators:\n$EMULATORS\n\n"

SELECTED_EMU="YouTrackMobile"

printf "Default emulator:\n$SELECTED_EMU\n\n"

if [ -z `echo "$EMULATORS" | grep -Fx "$SELECTED_EMU"` ];
then
  echo "Default emulator not found. Pick one of these:"

  counter=0
  for line in $EMULATORS; do
      counter=$(($counter+1))
      echo "[$counter] $line"
  done

  echo
  read EMU_INDEX

  SELECTED_EMU="$(echo "$EMULATORS" | head -$EMU_INDEX | tail -1)"
  echo "Selected: $SELECTED_EMU"
fi

$(which emulator) -avd $SELECTED_EMU -gpu on
