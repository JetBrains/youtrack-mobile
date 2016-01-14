import {StyleSheet} from 'react-native';

const PINK = '#FE0082';
const UNIT = 8;

module.exports = StyleSheet.create({
    listContainer: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: UNIT * 2,
        paddingRight: UNIT * 2,
        paddingTop: UNIT,
        paddingBottom: UNIT
    },
    rowText: {
        marginLeft: UNIT * 2,
        flex: 1
    },
    separator: {
        height: 0.5,
        marginLeft: 52,
        backgroundColor: '#CDCDDD'
    },
    summary: {
        fontWeight: 'bold',
        flexWrap: 'nowrap'
    },
    subtext: {
        paddingTop: UNIT,
        fontSize: 12
    },
    inputWrapper: {
        backgroundColor: PINK,
        flexDirection: 'row',
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
    cancelSearch: {
        paddingRight: UNIT*2,
        padding: UNIT
    },
    cancelText: {
        fontSize: 16,
        color: '#FFF'
    }
});