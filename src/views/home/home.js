import React, {View, StyleSheet, Image} from 'react-native';
import {logo} from '../../components/icon/icon';
import {UNIT} from '../../components/variables/variables';

export default class Home extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.logoImage} source={logo}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    logoImage: {
        height: UNIT * 20,
        resizeMode: 'contain'
    }
});