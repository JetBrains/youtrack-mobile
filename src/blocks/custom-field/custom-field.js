var React = require('react-native');
var {
    View,
    Text,
    StyleSheet
    } = React;

const SIZE = 20;

class ColorField extends React.Component {
    _getValue() {
        let field = this.props.field;
        if (field.name === 'Assignee') {
            return field.value[0].fullName
        }
        return field.value;
    }
    _getKey() {
        return this.props.field.name;
    }

    getTextColor() {
        let field = this.props.field;
        if (field.color) {
            return field.color.fg;
        }
    }

    render() {
        return (
            <View style={styles.wrapper}>
                <Text style={[styles.valueText, {
                color: this.getTextColor(),
                backgroundColor: this.props.color && field.color.bg
                }]}>{this._getValue()}</Text>
                <Text style={styles.keyText}>{this._getKey()}</Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    wrapper: {
        padding: 8
    },
    keyText: {
        paddingTop: 4,
        fontSize: 12
    },
    valueText: {
        fontWeight: 'bold'
    }
});

module.exports = ColorField;