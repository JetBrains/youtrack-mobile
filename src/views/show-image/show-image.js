var React = require('react-native');
var {
    StyleSheet,
    Image,
    View,
    TouchableHighlight,
    Text,
    ScrollView
    } = React;

var Dimensions = require('Dimensions');
var windowSize = Dimensions.get('window');

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
                <ScrollView contentContainerStyle={styles.scrollView} maximumZoomScale={20} contentInset={{top:0}} automaticallyAdjustContentInsets={false}>
                    <View style={{flex: 1}}>
                        <Image style={styles.image} source={{uri: this.props.imageUrl}}/>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    scrollView: {
        flex: 1
    },
    image: {
        resizeMode: 'contain',
        flex: 1
    }
});

module.exports = ShowImage;