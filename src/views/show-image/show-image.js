import React, {StyleSheet, Image, View, TouchableHighlight, Text, ScrollView} from 'react-native';
import {Actions} from 'react-native-router-flux';

import headerStyles from '../../components/header/header.styles';

class ShowImage extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={headerStyles.header}>
                    <TouchableHighlight
                        underlayColor="#FFF"
                        style={headerStyles.headerButton}
                        onPress={Actions.pop}>
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

const styles = StyleSheet.create({
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