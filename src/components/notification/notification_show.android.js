import {ToastAndroid} from 'react-native';

export default function showNotification (message, ...args) {
  console.warn(message, ...args);
  return ToastAndroid.show(message,  ToastAndroid.LONG)
}
