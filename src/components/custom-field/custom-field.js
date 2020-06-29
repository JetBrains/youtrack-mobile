/* @flow */

import React, {Component} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';

import ColorField from '../color-field/color-field';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {getHUBUrl} from '../../util/util';
import Avatar from '../avatar/avatar';
import ApiHelper from '../api/api__helper';

import styles from './custom-field.styles';

import type {CustomField as CustomFieldType, FieldValue} from '../../flow/CustomFields';
import type {User} from '../../flow/User';

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

  _renderColorMaker(value: ?FieldValue | ?Array<FieldValue>) {
    const firstColorCodedValue = value && [].concat(value).find(
      fieldValue => fieldValue.color
    );

    if (firstColorCodedValue) {
      return (
        <ColorField
          style={styles.colorMarker}
          text={firstColorCodedValue.name}
          color={firstColorCodedValue.color}
        />
      );
    }
  }

  _renderValue(value: Object | Array<Object>, fieldType: ?string) {
    const {active, disabled} = this.props;
    const textStyle = [
      styles.valueText,
      active && styles.valueTextActive,
      disabled && styles.valueTextDisabled
    ];

    const render = (val: Object | null) => {
      return (
        <View
          style={styles.value}
          key="value"
        >
          {val && fieldType === 'user' ? this.renderAvatar(val) : null}
          <Text testID="value" style={textStyle}>{this._getValue(val, fieldType)}</Text>
        </View>
      );
    };

    if (Array.isArray(value)) {
      if (!value.length) {
        return render(null);
      }

      return value.map((val, ind) => {
        return [
          render(val),
          <Text style={textStyle} key={val}>
            {ind === value.length - 1 ? ' ' : ', '}
          </Text>
        ];
      });
    }

    return render(value);
  }

  renderAvatar(fieldValue: User) {
    const user: User = ApiHelper.convertRelativeUrls([fieldValue], 'avatarUrl', getHUBUrl())[0];
    return (
      <Avatar
        testID="customFieldAvatar"
        style={styles.colorMarker}
        key={user.id}
        userName={getEntityPresentation(user)}
        size={20}
        source={{uri: user.avatarUrl}}
      />
    );
  }

  render() {
    const {field, active} = this.props;
    return (
      <TouchableOpacity
        style={[styles.wrapper, active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>

        <View style={styles.keyWrapper}>
          <Text
            style={styles.keyText}
            testID="name"
          >
            {this._getKey()}
          </Text>
        </View>

        <View style={styles.valuesWrapper}>
          {this._renderColorMaker(field.value)}
          {this._renderValue(field.value, this._getFieldType(field))}
        </View>


      </TouchableOpacity>
    );
  }
}
