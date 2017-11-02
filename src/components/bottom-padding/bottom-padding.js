import {Dimensions, Platform} from 'react-native';

const isIos = Platform.OS === 'ios';
const isIphoneX = isIos && Dimensions.get('window').height === 812;

const IPHONE_X_BOTTOM_PADDING = 12;

export default isIphoneX ? IPHONE_X_BOTTOM_PADDING : 0;
