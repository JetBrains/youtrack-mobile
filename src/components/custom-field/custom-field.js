import {TouchableOpacity, View, Text} from 'react-native';
import React, {PropTypes, Component} from 'react';
import styles from './custom-field.styles';

export default class CustomField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
    active: PropTypes.bool
  }

  _getFieldType(field: CustomField) {
    if (!field.projectCustomField.field.fieldType) {
      return null;
    }

    return field.projectCustomField.field.fieldType.valueType;
  }

  _getValue(value, fieldType) {
    const field = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (value) {
      if (fieldType === 'date') {
        return new Date(value).toLocaleDateString();
      }
      if (fieldType === 'integer') {
        return value;
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

  _renderValue(value, fieldType: string) {
    if (Array.isArray(value)) {
      if (!value.length) {
        return this._renderValue(null);
      }
      return value.map((val, ind) => {
        return [
          <Text key={val.id} style={[styles.valueText, this.getValueStyle(val)]}
                testID="value">{this._getValue(val, fieldType)}</Text>,
          ind === value.length - 1 ? <Text> </Text> : <Text>, </Text>
        ];
      });
    }

    return <Text style={[styles.valueText, this.getValueStyle(value)]} testID="value">{this._getValue(value, fieldType)}</Text>;
  }

  render() {
    const {field} = this.props;
    return (
      <TouchableOpacity
        style={[styles.wrapper, this.props.active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
        <View style={styles.valuesWrapper}>{this._renderValue(field.value, this._getFieldType(field))}</View>
        <Text style={[styles.keyText, this.props.disabled ? styles.valueTextDisabled : null]} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}
