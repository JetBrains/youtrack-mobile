import React, {TouchableOpacity, Text, StyleSheet, PropTypes} from 'react-native';
import getColorById from '../color-field/color-field__colors';

export default class CustomField extends React.Component {
  _getValue() {
    const field = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (field.value) {
      const value = field.value;
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return emptyValue;
        }
        return value.map(it => it.name || value.fullName || value.login).join(', ');
      }
      return value.name || value.fullName || value.login;
    }

    return emptyValue;
  }

  _getKey() {
    let field = this.props.field;
    return field.projectCustomField.field.name;
  }

  getValueStyle() {
    const field = this.props.field;

    if (!field.value || !field.value.color) {
      return;
    }
    const colorId = field.value.color.id;

    let color = getColorById(colorId).color;
    let backgroundColor = null;
    if (color === 'white' || color === '#FFF') {
      backgroundColor = getColorById(colorId).backgroundColor;
    }

    return {
      color: color,
      backgroundColor: backgroundColor
    }
  }

  render() {
    return (
      <TouchableOpacity style={styles.wrapper} onPress={this.props.onPress}>
        <Text style={[styles.valueText, this.getValueStyle()]} testID="value">{this._getValue()}</Text>
        <Text style={styles.keyText} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
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

CustomField.propTypes = {
  field: PropTypes.object.isRequired,
  onPress: PropTypes.func
};
