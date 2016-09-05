import {Alert} from 'react-native';

export default function showNotification (message, errorMessage) {
  return Alert.alert(message, errorMessage);
}
