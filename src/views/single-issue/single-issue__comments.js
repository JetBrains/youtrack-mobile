var React = require('react-native');

var styles = require('./single-issue.styles');

var {View, Text, Image} = React;
const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;

class SingleIssueComments extends React.Component {

    processCommentImages(comment, attachments) {
        let imageNames = comment.text.match(ImageRegExp);
        if (!imageNames || !imageNames.length) {
            return <Text key={comment.id}>{comment.text}</Text>;
        }
        let textNodes = comment.text.split(ImageRegExp);

        let commentView = [];
        (imageNames || []).forEach(function(imageName, index) {
            let attach = attachments.filter(a => `!${a.value}!` === imageName)[0];
            if (!attach) {
                return commentView.push(<Text key={index}>{textNodes[index]}</Text>);
            }
            //TODO: hack urls again
            let imgSrc = attach.url.replace('https://hackathon15.labs.intellij.net', 'http://hackathon15.labs.intellij.net:8080');

            commentView.push(<Text key={index}>{textNodes[index]}</Text>);
            commentView.push(<Image key={attach.id} style={styles.commentImage} source={{uri: imgSrc}} />);
        });

        return commentView
    }

    _renderCommentsList(comments, attachments) {
        return comments.map((comment) => {
            return (<View key={comment.id} style={styles.commentWrapper}>
                <Text>{comment.authorFullName} at {new Date(comment.created).toLocaleDateString()}</Text>
                <View
                    style={styles.commentText}>{this.processCommentImages(comment, attachments)}</View>
            </View>);
        });
    }

    render() {
        let issue = this.props.issue;
        let comments = issue.comment || [];

        let NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

        return (<View style={styles.commentsContainer}>
            {comments.length ? this._renderCommentsList(comments, issue.fieldHash.attachments) : NoComments}
        </View>);
    }
}

module.exports = SingleIssueComments;