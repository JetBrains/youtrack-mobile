import {DURATION} from 'react-native-easy-toast';

export default function showNotification (message, errorMessage, toastComponent) {
  return toastComponent.show(`${message}: ${errorMessage}`, DURATION.LENGTH_LONG);
}
