/* @flow */
import {TouchableOpacity, View, Text, Image} from 'react-native';
import React, {Component} from 'react';
import styles from './custom-field.styles';
import {lockInactive} from '../icon/icon';
import {NO_COLOR_ID} from '../color-field/color-field';
import type {CustomField as CustomFieldType, FieldValue} from '../../flow/CustomFields';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

type Props = {
  field: CustomFieldType,
  onPress: any => any,
  disabled: boolean,
  active: boolean
};

export default class CustomField extends Component<Props, void> {
  _getFieldType(field: CustomFieldType) {
    if (!field.projectCustomField.field.fieldType) {
      return null;
    }

    return field.projectCustomField.field.fieldType.valueType;
  }

  _getValue(value: FieldValue, fieldType: ?string): string {
    const field: CustomFieldType = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (value) {
      if (fieldType === 'date') {
        return new Date(value).toLocaleDateString();
      }
      if (fieldType === 'date and time') {
        const date = new Date(value).toLocaleDateString();
        const time = new Date(value).toLocaleTimeString([],
          {
            hour: '2-digit',
            minute: '2-digit'
          });
        return `${date} ${time}`;
      }
      if (fieldType === 'integer' || fieldType === 'string' || fieldType === 'float') {
        return value;
      }
      return getEntityPresentation(value);
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

  _renderValue(value, fieldType: ?string) {
    const {active, disabled} = this.props;
    const textStyle = [
      styles.valueText,
      active && styles.valueTextActive,
      disabled && styles.valueTextDisabled
    ];

    const renderOneValue = (val) => {
      return <Text style={textStyle} testID="value" key="value">{this._getValue(val, fieldType)}</Text>;
    };

    if (Array.isArray(value)) {
      if (!value.length) {
        return renderOneValue(null);
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
    const {field, active, disabled} = this.props;
    return (
      <TouchableOpacity
        style={[styles.wrapper, active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>

        <View style={styles.keyWrapper}>
          {disabled && <Image style={styles.keyLockedIcon} source={lockInactive}/>}
          <Text
            style={styles.keyText}
            testID="name"
          >
            {this._getKey()}
          </Text>
        </View>

        <View style={styles.valuesWrapper}>
          {this._renderValue(field.value, this._getFieldType(field))}
        </View>

        {this._renderColorMaker(field.value)}

      </TouchableOpacity>
    );
  }
}
