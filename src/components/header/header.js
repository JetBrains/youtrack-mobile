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

    onRightButtonClick() {
        if (this.props.onRightButtonClick) {
            return this.props.onRightButtonClick();
        }
    }

    render() {
        return (<View style={styles.header}>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => this.onBack()}>
                <Text style={styles.headerButtonText}>{this.props.leftButton}</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>{this.props.children}</View>

            <TouchableOpacity
                style={styles.headerButton}
                onPress={this.onRightButtonClick.bind(this)}>
                <Text style={styles.headerButtonText}>{this.props.rightButton}</Text>
            </TouchableOpacity>
        </View>);
    }
}