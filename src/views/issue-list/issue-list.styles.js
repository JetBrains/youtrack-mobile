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
    id: {
        width: 48
    },
    description: {
        marginLeft: 16
    }
});