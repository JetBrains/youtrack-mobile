var React = require('react-native');

var styles = require('./single-issue.styles');
let Avatar = require('../../blocks/avatar/avatar');
let relativeDate = require('relative-date');
let TextWithImages = require('../../blocks/text-with-images/text-with-images');

var {View, Text, Image} = React;
const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;

class SingleIssueComments extends React.Component {

    _renderComment(comment, attachments) {
        return TextWithImages.renderView(comment.text, attachments);
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