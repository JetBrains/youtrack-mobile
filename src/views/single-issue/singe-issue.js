var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    ScrollView
    } = React;

var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
let issueListStyles = require('../issue-list/issue-list.styles');
let styles = require('./single-issue.styles');

class SingeIssueView extends React.Component {
    componentDidMount() {
        this.api = this.props.api;
        this.state = {issue: {}};

        this.loadIssue(this.props.issueId);
    }

    loadIssue(id) {
        return this.api.getIssue(id)
            .then((issue) => ApiHelper.fillFieldHash(issue))
            .then((issue) => {
                console.log('Issue', issue);
                this.setState({issue});
            })
            .catch((res) => {
                console.error(res);
            });
    }

    getAuthorForText(issue) {
        var forText = () => {
            if (issue.fieldHash.Assignee) {
                return 'for ' + issue.fieldHash.Assignee[0].fullName;
            }
            return '    Unassigned'
        };
        return `${issue.fieldHash.reporterFullName} ${forText()}`
    }

    _renderHeader() {
        return (
            <View style={issueListStyles.headerContainer}>
                <TouchableHighlight
                    underlayColor="#FFF"
                    style={issueListStyles.logOut}
                    onPress={() => this.props.onBack()}>
                    <Text style={issueListStyles.logOut__text}>List</Text>
                </TouchableHighlight>

                <Text style={styles.headerText}>{this.props.issueId}</Text>
            </View>
        )
    }

    _renderAttachments(attachments) {
        return (attachments || {}).map((attach) => {
            //TODO: hacking https certificate error. REMOVE IT!
            let imgSrc = attach.url.replace('https://hackathon15.labs.intellij.net', 'http://hackathon15.labs.intellij.net:8080');
            return <Image
                key={attach.id}
                style={styles.attachment}
                capInsets={{left: 15, right: 15, bottom: 15, top: 15}}
                source={{uri: imgSrc}}/>;
        });
    }

    _renderIssueView(issue) {
        return (
            <View style={styles.issueViewContainer}>
                <Text style={styles.authorForText}>{this.getAuthorForText(issue)}</Text>
                <Text style={styles.summary}>{issue.fieldHash.summary}</Text>
                <Text style={styles.description}>{issue.fieldHash.description}</Text>

                <ScrollView style={styles.attachesContainer} horizontal={true}>
                    {this._renderAttachments(issue.fieldHash.attachments)}
                </ScrollView>
            </View>
        );
    }

    _renderCommentsView(issue) {
        let commentsList = (issue.comment || {}).map((comment) => {
            return (<View key={comment.id} style={styles.commentWrapper}>
                <Text>{comment.authorFullName} at {new Date(comment.created).toLocaleDateString()}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
            </View>);
        });

        return (<View style={styles.commentsContainer}>
            {commentsList}
        </View>);
    }

    render() {
        let issueView;
        let commentsView;
        if (this.state && this.state.issue) {
            issueView = this._renderIssueView(this.state.issue);
            commentsView = this._renderCommentsView(this.state.issue);
        }
        return (
            <View style={styles.container}>
                {this._renderHeader()}
                <ScrollView>
                    {issueView}
                    {commentsView}
                </ScrollView>
            </View>
        );
    }
}

module.exports = SingeIssueView;