import {ToastAndroid} from 'react-native';

const DURATION = 10000;

export default function showNotification (message, errorMessage, component, duration = DURATION) {
  const details = errorMessage ? `: ${errorMessage}` : '';
  return ToastAndroid.show(`${message}${details}`, duration);
}
