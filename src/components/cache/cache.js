/* @flow */
import {AsyncStorage} from 'react-native';

export default class Cache {
  key: string;

  constructor(key: string) {
    if (!key) {
      throw new Error('Cache: Key should be defined');
    }
    this.key = key;
  }

  read() {
    return AsyncStorage.getItem(this.key)
      .then((data: string) => JSON.parse(data));
  }

  store(data: Object) {
    return AsyncStorage.setItem(this.key, JSON.stringify(data))
      .then(() => data);
  }
}
