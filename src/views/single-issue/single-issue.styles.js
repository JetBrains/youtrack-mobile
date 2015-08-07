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
        flex: 1,
        textAlign:'center'
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
    commentInputWrapper: {
        backgroundColor: '#EBEBEB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    commentInput: {
        flex: 1,
        height: UNIT * 4,
        borderRadius: 6,
        backgroundColor: '#FFF',
        color: '#7E7E84',
        margin: UNIT,
        padding: 6
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