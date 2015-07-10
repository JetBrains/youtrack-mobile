var StyleSheet = require('react-native').StyleSheet;

let PINK = '#FE0082';
let LIGHT_GRAY = '#EFEFEF';
let UNIT = 8;

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    headerText: {
        top: 11,
        left: 145
    },
    issueViewContainer: {
        padding: UNIT * 2
    },
    authorForText: {
        color: '#666'
    },
    summary: {
        paddingTop: UNIT * 2,
        fontSize: 18,
        fontWeight: 'bold'
    },
    description: {
        paddingTop: UNIT * 2
    },
    attachesContainer: {
        marginTop: UNIT*2
    },
    attachment: {
        marginRight: UNIT*2,
        width: 150,
        height: 100,
        resizeMode: 'cover'
    }
});

module.exports = styles;