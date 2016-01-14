import React, {View, Text, StyleSheet} from 'react-native';

const SIZE = 20;

class ColorField extends React.Component {
    _getBackgroundColor() {
        return this.props.field.color && this.props.field.color.bg;
    }
    _getForegroundColor() {
        return this.props.field.color && this.props.field.color.fg;
    }
    _getFieldLetter() {
        return this.props.field[0].substr(0, 1);
    }
    render() {
        return (
          <View style={[styles.wrapper, {backgroundColor: this._getBackgroundColor()}]}>
              <Text style={[styles.text, {color: this._getForegroundColor()}]}>{this._getFieldLetter()}</Text>
          </View>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        width: SIZE,
        height: SIZE,
        borderRadius: 4,
        flex: 1,
        justifyContent: 'center'
    },
    text: {
        fontSize: 12,
        textAlign: 'center'
    }
});

module.exports = ColorField;