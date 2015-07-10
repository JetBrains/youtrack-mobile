var StyleSheet = require('react-native').StyleSheet;

let PINK = '#FE0082';
let LIGHT_GRAY = '#F8F8F8';
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
        borderRadius: 4,
        resizeMode: 'cover'
    },
    commentsContainer: {
        padding: UNIT * 2,
        backgroundColor: '#F8F8F8'
    },
    commentWrapper: {
        marginBottom: UNIT*2
    },
    commentText: {
        marginTop: UNIT
    }
});

module.exports = styles;