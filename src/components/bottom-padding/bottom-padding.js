import {Dimensions, Platform} from 'react-native';

const isIos = Platform.OS === 'ios';
const X_XS_SIZE = 812;
const XS_MAX_XR_SIZE = 896;
const isIphoneX = isIos && [X_XS_SIZE, XS_MAX_XR_SIZE].includes(Dimensions.get('window').height);

const IPHONE_X_BOTTOM_PADDING = 12;

export default isIphoneX ? IPHONE_X_BOTTOM_PADDING : 0;
