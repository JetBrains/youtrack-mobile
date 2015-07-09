var StyleSheet = require('react-native').StyleSheet;

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
      backgroundColor: '#66A'
    },
    searchInput: {
        height: 24,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 6,
        textAlign: 'center',
        backgroundColor: '#EEE',
        margin: 8,
        padding: 6
    }
});