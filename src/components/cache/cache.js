import {AsyncStorage} from 'react-native';

export default class Cache {
    constructor(key) {
        if (!key) {
            throw new Error('Cache: Key should be defined');
        }
        this.key = key;
    }

    read() {
        return AsyncStorage.getItem(this.key)
            .then((data) => JSON.parse(data));
    }

    store(data) {
        return AsyncStorage.setItem(this.key, JSON.stringify(data))
            .then(() => data);
    }
}