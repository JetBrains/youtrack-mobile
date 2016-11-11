import {TouchableOpacity, View, Text} from 'react-native';
import React, {PropTypes, Component} from 'react';
import styles from './custom-field.styles';
import NumberPolifyll from 'core-js/es6/number';

export default class CustomField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
    active: PropTypes.bool
  }

  _getValue(value) {
    const field = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (value) {
      if (NumberPolifyll.isInteger(value)) {
        return new Date(value).toLocaleDateString();
      }
      return value.name || value.fullName || value.login || value.presentation;
    }

    return emptyValue;
  }

  _getKey() {
    const field = this.props.field;
    return field.projectCustomField.field.name;
  }

  getValueStyle(value) {
    if (!value || !value.color) {
      return;
    }

    return {
      color: value.color.foreground,
      backgroundColor: value.color.background
    };
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
        style={[styles.wrapper, this.props.active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
        <View style={styles.valuesWrapper}>{this._renderValue(this.props.field.value)}</View>
        <Text style={[styles.keyText, this.props.disabled ? styles.valueTextDisabled : null]} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}
