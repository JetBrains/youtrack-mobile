var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    TouchableHighlight
    } = React;

var Api = require('../../blocks/api/api');
var ApiHelper = require('../../blocks/api/api__helper');
let issueListStyles = require('../issue-list/issue-list.styles');

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

    render() {
        return (
            <View style={styles.container}>
                {this._renderHeader()}
                <Text>
                    {this.state && this.state.issue}
                </Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    },
    headerText: {
        top: 11,
        left: 145
    }
});

module.exports = SingeIssueView;