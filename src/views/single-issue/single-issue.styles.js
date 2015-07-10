var StyleSheet = require('react-native').StyleSheet;

let PINK = '#FE0082';
let LIGHT_GRAY = '#F8F8F8';
let UNIT = 8;

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_GRAY
    },
    headerText: {
        top: 11,
        left: 145
    },
    issueViewContainer: {
        padding: UNIT * 2,
        backgroundColor: '#FFF'
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
        marginTop: UNIT * 2
    },
    attachment: {
        marginRight: UNIT * 2,
        width: 150,
        height: 100,
        borderRadius: 4,
        resizeMode: 'cover'
    },
    commentsContainer: {
        padding: UNIT * 2
    },
    commentWrapper: {
        flexDirection: 'row',
        marginBottom: UNIT * 2
    },
    avatar: {
        width: UNIT * 4,
        height: UNIT * 4,
        borderRadius: UNIT * 2
    },
    comment: {
        marginTop: UNIT/2,
        marginLeft: UNIT,
        flex: 1
    },
    commentText: {
        marginTop: UNIT
    },
    commentImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain'
    },
    footer: {
        paddingLeft: UNIT,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        height: 56
    },
    footerIcon: {
        width: 24,
        height: 24
    },
    iconButton: {
        justifyContent: 'center',
        padding: 8
    }
});

module.exports = styles;