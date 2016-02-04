import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_LIGHT_GRAY} from '../../components/variables/variables';
import TOP_PADDING from './header__top-padding';

module.exports = StyleSheet.create({
    header: {
        paddingTop: TOP_PADDING,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',

        backgroundColor: COLOR_LIGHT_GRAY
    },
    headerButton: {
        width: UNIT*9,
        padding: 0,
        paddingLeft: UNIT,
        paddingRight: UNIT
    },
    headerButtonText: {
        color: COLOR_PINK
    },
    headerCenter: {
        padding: 0,
        textAlign: 'center'
    }
});