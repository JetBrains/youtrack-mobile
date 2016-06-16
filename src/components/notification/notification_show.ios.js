import {Alert} from 'react-native';

export default function showNotification (message, ...args) {
  console.warn(message, ...args);
  return Alert.alert(message, args);
}
