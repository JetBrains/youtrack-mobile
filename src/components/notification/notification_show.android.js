import {ToastAndroid} from 'react-native';

export default function showNotification (message, errorMessage) {
  return ToastAndroid.show(`${message}: ${errorMessage}`, ToastAndroid.LONG)
}
