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

  read(): Promise<?any> {
    return AsyncStorage.getItem(this.key)
      .then((data: string) => JSON.parse(data));
  }

  store(data: any): Promise<any> {
    return AsyncStorage.setItem(this.key, JSON.stringify(data))
      .then(() => data);
  }
}
