var StyleSheet = require('react-native').StyleSheet;

let BLUE = '#1B9FD6';

module.exports = StyleSheet.create({
    listContainer: {
        flex: 1,
        backgroundColor: '#F6F6F6'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
    },
    subtext: {
        fontSize: 12
    },
    summary: {
        fontWeight: 'bold'
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