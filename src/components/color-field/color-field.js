import React, {View, Text, StyleSheet, PropTypes} from 'react-native';
import getColorById from './color-field__colors';

const SIZE = 22;

export default class ColorField extends React.Component {
  _getBackgroundColor() {
    return this.props.field.color && getColorById(this.props.field.color.id).backgroundColor;
  }

  _getForegroundColor() {
    return this.props.field.color && getColorById(this.props.field.color.id).color;
  }

  _getBorderColor() {
    return this.props.field.color && getColorById(this.props.field.color.id).borderColor;
  }

  _getFieldLetter() {
    return this.props.fullText ? this.props.field.name : this.props.field.name.substr(0, 1);
  }

  render() {
    return (
      <View style={[styles.wrapper, {backgroundColor: this._getBackgroundColor(), borderColor: this._getBorderColor()}]}>
        <Text style={[styles.text, {color: this._getForegroundColor()}]}>{this._getFieldLetter()}</Text>
      </View>
    );
  }
}

ColorField.propTypes = {
  field: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: 4,
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center'
  },
  text: {
    fontSize: 12,
    textAlign: 'center'
  }
});
