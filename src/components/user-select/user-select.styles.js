import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_PINK, FOOTER_HEIGHT} from '../../components/variables/variables';

export default StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: FOOTER_HEIGHT,
        backgroundColor: '#FFFFFFF4'
    },
    inputWrapper: {
        backgroundColor: COLOR_LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchInput: {
        flex: 1,
        height: UNIT * 4,
        borderRadius: 6,
        backgroundColor: '#FFF',
        color: '#7E7E84',
        margin: UNIT,
        padding: 6
    },
    separator: {
        height: 0.5,
        backgroundColor: '#C8C7CC'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems:'center',
        padding: UNIT
    },
    avatar: {
        width: UNIT * 4,
        height: UNIT * 4,
        borderRadius: UNIT * 2
    },
    userName: {
        marginLeft: UNIT*2,
        fontSize: 18,
        color: COLOR_PINK
    }
});