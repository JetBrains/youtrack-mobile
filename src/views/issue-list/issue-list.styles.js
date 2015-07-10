var StyleSheet = require('react-native').StyleSheet;

let BLUE = '#2CB8E6';
let PINK = '#C90162';
let LIGHT_GRAY = '#EFEFEF';

module.exports = StyleSheet.create({
    headerContainer: {
        height: 56,
        paddingLeft: 16,
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
        padding: 16
    },
    rowText: {
      marginLeft: 16
    },
    separator: {
        height: 0.5,
        marginLeft: 48,
        backgroundColor: '#CDCDDD'
    },
    subtext: {
        fontSize: 12
    },
    summary: {
        fontWeight: 'bold',
        flexWrap: 'nowrap'
    },
    inputWrapper: {
      backgroundColor: BLUE
    },
    searchInput: {
        height: 32,
        borderRadius: 6,
        textAlign: 'center',
        backgroundColor: '#FFF',
        color: '#7E7E84',
        margin: 8,
        padding: 6
    }
});