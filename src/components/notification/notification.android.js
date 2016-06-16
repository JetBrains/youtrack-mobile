import {ToastAndroid} from 'react-native';

export default function showNotification (message, duration = ToastAndroid.LONG) {
  return ToastAndroid.show(message, duration)
}
