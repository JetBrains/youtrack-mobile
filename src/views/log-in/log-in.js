import React, {StyleSheet, Text, View} from 'react-native';

class LogIn extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Logging in YouTrack Mobile...
                </Text>
                <Text style={styles.message}>{this.props.message}</Text>
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
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    message: {
        color: 'red',
        textAlign: 'center',
        margin: 10
    }
});

module.exports = LogIn;