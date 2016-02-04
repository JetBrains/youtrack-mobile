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
        return (<View style={styles.header}>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => this.onBack()}>
                {this.props.leftButton}
            </TouchableOpacity>

            <Text style={styles.headerCenter}>{this.props.title}</Text>

            <View style={styles.headerButton}>{this.props.rightButton}</View>
        </View>);
    }
}