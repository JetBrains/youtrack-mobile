var StyleSheet = require('react-native').StyleSheet;

let BLUE = '#2CB8E6';
let PINK = '#C90162';
let LIGHT_GRAY = '#EFEFEF';
let UNIT = 8;

module.exports = StyleSheet.create({
    headerContainer: {
        height: 56,
        paddingLeft: UNIT*2,
        backgroundColor: LIGHT_GRAY
    },
    logOut: {
        width: 58,
        top: 28
    },
    logOut__text: {
        color: PINK
    },
    logo: {
        top: 4,
        left: 160,
        width: 28,
        height: 28
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: UNIT*2,
        paddingRight: UNIT*2,
        paddingTop: UNIT,
        paddingBottom: UNIT
    },
    rowText: {
      marginLeft: UNIT*2
    },
    separator: {
        height: 0.5,
        marginLeft: 48,
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
      backgroundColor: BLUE
    },
    searchInput: {
        height: UNIT*4,
        borderRadius: 6,
        textAlign: 'center',
        backgroundColor: '#FFF',
        color: '#7E7E84',
        margin: UNIT,
        padding: 6
    }
});