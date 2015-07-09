var React = require('react-native');
var {View, Text, TouchableHighlight} = React;

class YouTrackMobile extends React.Component {

    logOut() {
        this.props.auth.logOut()
            .then(() => this.props.onBack());
    }

    render() {
        return (<View>
            <Text>Test Issues List</Text>

            <TouchableHighlight
                style={{borderWidth: 1}}
                onPress={this.logOut.bind(this)}>
                <Text>Log Out</Text>
            </TouchableHighlight>
        </View>);
    }
}

module.exports = YouTrackMobile;
