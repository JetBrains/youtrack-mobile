var StyleSheet = require('react-native').StyleSheet;

let PINK = '#FE0082';
let LIGHT_GRAY = '#F8F8F8';
let UNIT = 8;

module.exports = StyleSheet.create({
    headerContainer: {
        height: 56,
        paddingLeft: UNIT * 2,
        backgroundColor: LIGHT_GRAY
    },
    logOut: {
        width: 58,
        top: 28
    },
    logOut__text: {
        color: PINK
    },
    sortBy: {
        top: 11,
        left: 120
    },
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
        textAlign: 'center',
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