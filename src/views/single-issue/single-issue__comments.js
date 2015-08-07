var React = require('react-native');

var styles = require('./single-issue.styles');
let Avatar = require('../../blocks/avatar/avatar');
let relativeDate = require('relative-date');

var {View, Text, Image} = React;
const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;

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

            commentView.push(<Text key={index}>{textNodes[index]}</Text>);
            commentView.push(<Image key={attach.id} style={styles.commentImage} source={{uri: attach.url}}/>);
        });

        return commentView
    }

    _renderCommentsList(comments, attachments) {
        return comments.map((comment) => {
            return (
                <View key={comment.id} style={styles.commentWrapper}>
                    <Avatar style={styles.avatar} api={this.props.api} authorLogin={comment.author}/>
                    <View style={styles.comment}>
                        <Text>
                            <Text style={{color: '#1CAFE4'}}>{comment.authorFullName}</Text>
                            <Text style={{color: '#888'}}> {relativeDate(comment.created)}</Text>
                        </Text>
                        <View style={styles.commentText}>{this._renderComment(comment, attachments)}</View>
                    </View>
                </View>
            );
        });
    }

    render() {
        let issue = this.props.issue;
        let comments = (issue.comment || []).reduceRight((val, item) => val.concat([item]), []); //reverse to get designed order of comments

        let NoComments = <Text style={{textAlign: 'center'}}>No comments yet</Text>;

        return (<View style={styles.commentsContainer}>
            {comments.length ? this._renderCommentsList(comments, issue.fieldHash.attachments) : NoComments}
        </View>);
    }
}

module.exports = SingleIssueComments;