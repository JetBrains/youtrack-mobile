var React = require('react-native');
var {
    StyleSheet,
    Image,
    View,
    TouchableHighlight,
    Text
    } = React;

let headerStyles = require('../../blocks/header/header.styles');

class ShowImage extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={headerStyles.header}>
                    <TouchableHighlight
                        underlayColor="#FFF"
                        style={headerStyles.headerButton}
                        onPress={this.props.onBack.bind(this)}>
                        <Text style={headerStyles.headerButtonText}>Back</Text>
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