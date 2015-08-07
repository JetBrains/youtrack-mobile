var React = require('react-native');
var {
    StyleSheet,
    Image,
    View,
    TouchableHighlight,
    Text
    } = React;

let issueListStyles = require('../issue-list/issue-list.styles');

class ShowImage extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={issueListStyles.headerContainer}>
                    <TouchableHighlight
                        underlayColor="#FFF"
                        style={issueListStyles.logOut}
                        onPress={this.props.onBack.bind(this)}>
                        <Text style={issueListStyles.logOut__text}>Back</Text>
                    </TouchableHighlight>
                </View>
                <Image style={styles.image} source={{uri: this.props.imageUrl}}/>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    image: {
        flex: 1,
        resizeMode: 'contain'
    }
});

module.exports = ShowImage;