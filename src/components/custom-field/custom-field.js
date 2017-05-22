import {TouchableOpacity, View, Text} from 'react-native';
import React, {PropTypes, Component} from 'react';
import styles from './custom-field.styles';
import {NO_COLOR_ID} from '../color-field/color-field';

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
      if (fieldType === 'integer' || fieldType === 'string' || fieldType === 'float') {
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

  _renderColorMaker(value) {
    const values = [].concat(value);
    if (!values || !values.length) {
      return;
    }

    const renderSingleMarker = (val) => {
      if (!val || !val.color) {
        return;
      }
      if (val.color.id === NO_COLOR_ID) {
        return;
      }
      return <View key={val.id} style={[styles.colorMarker, {backgroundColor: val.color.background}]}/>;
    };

    return (
      <View style={styles.colorMarkerContainer}>
        {values.map(renderSingleMarker)}
      </View>
    );
  }

  _renderValue(value, fieldType: string) {
    const {active} = this.props;
    const textStyle = [styles.valueText, active && styles.valueTextActive];

    const renderOneValue = (val) => {
      return <Text style={textStyle} testID="value">{this._getValue(val, fieldType)}</Text>;
    };

    if (Array.isArray(value)) {
      if (!value.length) {
        return this._renderValue(null);
      }
      return value.map((val, ind) => {
        return [
          renderOneValue(val),
          <Text style={textStyle} key={val}>
            {ind === value.length - 1 ? ' ' : ', '}
          </Text>
        ];
      });
    }

    return renderOneValue(value);
  }

  render() {
    const {field, active} = this.props;
    return (
      <TouchableOpacity
        style={[styles.wrapper, active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
          {this._renderColorMaker(field.value)}
          <View style={styles.valuesWrapper}>{this._renderValue(field.value, this._getFieldType(field))}</View>
          <Text style={[styles.keyText, this.props.disabled ? styles.valueTextDisabled : null]} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}
