import React, {Text, View, TouchableOpacity} from 'react-native';
import styles from './header.styles';
import {Actions} from 'react-native-router-flux';

export default class Header extends React.Component {
    onBack() {
        if (this.props.onBack) {
            return this.props.onBack();
        }
        return Actions.pop();
    }
    render() {
        console.log('>>>>>>', this)
        return (<View style={styles.header}>
            <TouchableOpacity
                underlayColor="#FFF"
                style={styles.headerButton}
                onPress={() => this.onBack()}>
                <Text style={styles.headerButtonText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.headerCenter}>Sort by: Updated</Text>

            <View style={styles.headerButton}></View>
        </View>);
    }
}