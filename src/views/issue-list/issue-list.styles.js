var StyleSheet = require('react-native').StyleSheet;

let BLUE = '#1B9FD6';
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
        padding: 10
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
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
        height: 24,
        borderRadius: 6,
        textAlign: 'center',
        backgroundColor: '#EEE',
        margin: 8,
        padding: 6
    }
});