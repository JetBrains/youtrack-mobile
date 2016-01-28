import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_LIGHT_GRAY} from '../../components/variables/variables';

module.exports = StyleSheet.create({
    header: {
        paddingTop: UNIT*3,
        paddingBottom: 10,
        flexDirection: 'row',

        backgroundColor: COLOR_LIGHT_GRAY
    },
    headerButton: {
        width: UNIT*9,
        padding: UNIT/2,
        paddingLeft: UNIT,
        paddingRight: UNIT
    },
    headerButtonText: {
        color: COLOR_PINK
    },
    headerCenter: {
        padding: UNIT/2,
        flex: 1,
        textAlign: 'center'
    }
});