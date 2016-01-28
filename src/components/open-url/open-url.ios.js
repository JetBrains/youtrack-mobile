import {LinkingIOS} from 'react-native';

export default function openUrl(url) {
    LinkingIOS.openURL(url);
}