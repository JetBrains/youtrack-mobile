var React = require('react-native');
var {
    StyleSheet,
    Text,
    View
    } = React;

class SingeIssueView extends React.Component {

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    {this.props.issue}
                </Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    }
});

module.exports = SingeIssueView;