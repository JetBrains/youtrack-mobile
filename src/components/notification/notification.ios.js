import {Alert} from 'react-native';

export default function showNotification (message) {
  return Alert.alert('Something went wrong...', message);
}
