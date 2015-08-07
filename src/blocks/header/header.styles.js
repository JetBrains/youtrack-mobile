var StyleSheet = require('react-native').StyleSheet;
let UNIT = 8;
let PINK = '#FE0082';
let LIGHT_GRAY = '#F8F8F8';

module.exports = StyleSheet.create({
    header: {
        paddingTop: UNIT*3,
        paddingBottom: 10,
        flexDirection: 'row',

        backgroundColor: LIGHT_GRAY
    },
    headerButton: {
        width: UNIT*9,
        padding: UNIT/2,
        paddingLeft: UNIT,
        paddingRight: UNIT
    },
    headerButtonText: {
        color: PINK
    },
    headerCenter: {
        padding: UNIT/2,
        flex: 1,
        textAlign: 'center'
    }
});