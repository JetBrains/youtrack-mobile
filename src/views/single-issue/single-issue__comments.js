var React = require('react-native');

var styles = require('./single-issue.styles');
let Avatar = require('../../blocks/avatar/avatar');

var {View, Text, Image} = React;
const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;
const HTTP_BASE_URL = 'http://hackathon15.labs.intellij.net:8080';

class SingleIssueComments extends React.Component {

    /**
     * Hackish code to replace !ImageName.png! syntax with image nodes, and other text with text nodes
     * @param comment - issue comment
     * @param attachments - issue attachments field
     * @returns {View} - list of comment text and image nodes
     */
    _renderComment(comment, attachments) {
        let imageNames = comment.text.match(ImageRegExp);
        if (!imageNames || !imageNames.length) {
            return <Text key={comment.id}>{comment.text}</Text>;
        }
        let textNodes = comment.text.split(ImageRegExp);

        let commentView = [];
        (imageNames || []).forEach(function (imageName, index) {
            let attach = attachments.filter(a => `!${a.value}!` === imageName)[0];
            if (!attach) {
                return commentView.push(<Text key={index}>{textNodes[index]}</Text>);
            }
            //TODO: hack urls again
            let imgSrc = attach.url.replace('https://hackathon15.labs.intellij.net', HTTP_BASE_URL);

            commentView.push(<Text key={index}>{textNodes[index]}</Text>);
            commentView.push(<Image key={attach.id} style={styles.commentImage} source={{uri: imgSrc}}/>);
        });

        return commentView
    }

    _getAvatarUri(authorName) {
        this.props.api.getUser(HTTP_BASE_URL + '/hub', authorName)
            .then((user) => {
                debugger;
            })
            .catch(() => {
                debugger;
            });
        return 'http://facebook.github.io/react/img/logo_og.png';
    }

    _renderCommentsList(comments, attachments) {
        return comments.map((comment) => {
            return (
                <View key={comment.id} style={styles.commentWrapper}>
                    <Avatar style={styles.avatar} api={this.props.api} authorName={comment.authorFullName}/>
                    <View style={styles.comment}>
                        <Text>
                            <Text style={{color: '#1CAFE4'}}>{comment.authorFullName}</Text>
                            <Text style={{color: '#888'}}> on {new Date(comment.created).toLocaleDateString()}</Text>
                        </Text>
                        <View style={styles.commentText}>{this._renderComment(comment, attachments)}</View>
                    </View>
                </View>
            );
        });
    }

    render() {
        let issue = this.props.issue;
        let comments = (issue.comment || []) //reverse to get designed order of comments

        let NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

        return (<View style={styles.commentsContainer}>
            {comments.length ? this._renderCommentsList(comments, issue.fieldHash.attachments) : NoComments}
        </View>);
    }
}

module.exports = SingleIssueComments;