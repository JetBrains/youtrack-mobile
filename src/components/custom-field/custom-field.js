import React, {TouchableOpacity, View, Text, StyleSheet, PropTypes} from 'react-native';
import getColorById from '../color-field/color-field__colors';
import {COLOR_FONT_GRAY} from '../variables/variables';

export default class CustomField extends React.Component {
  _getValue(value) {
    const field = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (value) {
      return value.name || value.fullName || value.login;
    }

    return emptyValue;
  }

  _getKey() {
    let field = this.props.field;
    return field.projectCustomField.field.name;
  }

  getValueStyle(value) {
    if (!value || !value.color) {
      return;
    }
    const colorId = value.color.id;

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

  _renderValue(value) {
    if (Array.isArray(value)) {
      if (!value.length) {
        return this._renderValue(null);
      }
      return value.map((val, ind) => {
        return [
          <Text key={val.id} style={[styles.valueText, this.getValueStyle(val)]}
                testID="value">{this._getValue(val)}</Text>,
          ind === value.length - 1 ? <Text> </Text> : <Text>, </Text>
        ];
      });
    }

    return <Text style={[styles.valueText, this.getValueStyle(value)]} testID="value">{this._getValue(value)}</Text>;
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
        <View style={styles.valuesWrapper}>{this._renderValue(this.props.field.value)}</View>
        <Text style={[styles.keyText, this.props.disabled ? styles.valueTextDisabled : null]} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 8
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  keyText: {
    marginTop: 2,
    paddingTop: 4,
    fontSize: 12
  },
  valueText: {
    fontWeight: 'bold',
    margin: -2,
    padding: 2
  },
  valueTextDisabled: {
    color: COLOR_FONT_GRAY
  }
});

CustomField.propTypes = {
  field: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  disabled: PropTypes.bool
};
