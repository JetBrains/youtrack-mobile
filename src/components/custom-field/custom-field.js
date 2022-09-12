/* @flow */

import React, {Component} from 'react';
import {TouchableOpacity, View, Text, Linking} from 'react-native';

import ApiHelper from '../api/api__helper';
import Avatar from '../avatar/avatar';
import ColorField from '../color-field/color-field';
import IconUrl from '@jetbrains/icons/new-window.svg';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {getHUBUrl, isURLPattern} from 'util/util';
import {HIT_SLOP} from '../common-styles/button';
import {ytDate} from 'components/date/date';

import styles from './custom-field.styles';

import type {CustomField as CustomFieldType, FieldValue} from 'flow/CustomFields';
import type {Node} from 'react';
import type {User} from 'flow/User';

type Props = {
  field: CustomFieldType,
  onPress: any => any,
  disabled: boolean,
  active: boolean
};

const maxValueStringWidth: number = 30;


export default class CustomField extends Component<Props, void> {
  _getFieldType(field: CustomFieldType) {
    if (!field?.projectCustomField?.field?.fieldType) {
      return null;
    }

    return field.projectCustomField.field.fieldType.valueType;
  }

  _getValue(value: ?FieldValue, fieldType: ?string): ?string {
    const field: CustomFieldType = this.props.field;
    const emptyValue: ?string = field?.projectCustomField?.emptyFieldText || '';

    if (value != null) {
      if (fieldType === 'date') {
        return ytDate(((value: any): number), true);
      }
      if (fieldType === 'date and time') {
        return ytDate(((value: any): Date));
      }
      if (fieldType === 'integer' || fieldType === 'string' || fieldType === 'float') {
        return `${(value: any)}`;
      }
      return getEntityPresentation(value);
    }

    return emptyValue;
  }

  getLabel() {
    const field: CustomFieldType = this.props.field;
    const label: string = (
      field?.projectCustomField?.field?.localizedName ||
      field?.localizedName ||
      field?.projectCustomField?.field?.name ||
      field?.name ||
      ''
    );
    return label.length > maxValueStringWidth ? `${label.substring(0, maxValueStringWidth)}…` : label;
  }

  _renderColorMaker(value: ?FieldValue | ?Array<FieldValue>) {
    const firstColorCodedValue = value && [].concat(value).find(
      fieldValue => fieldValue.color
    );

    if (firstColorCodedValue) {
      return (
        <ColorField
          style={styles.colorMarker}
          text={firstColorCodedValue.localizedName || firstColorCodedValue.name}
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
      disabled && styles.valueTextDisabled,
    ];

    const render = (val: Object | null) => {
      const valuePresentation: string = this._getValue(val, fieldType) || '';
      return (
        <View
          style={styles.value}
          key="value"
        >
          {val && fieldType === 'user' ? this.renderAvatar(val) : null}
          <Text
            testID="test:id/value"
            accessibilityLabel="value"
            accessible={true}
            style={textStyle}
          >
            {valuePresentation?.length > maxValueStringWidth
              ? `${valuePresentation.substring(0, maxValueStringWidth)}…`
              : valuePresentation}
          </Text>
          {isURLPattern(valuePresentation) && <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={() => Linking.openURL(valuePresentation.trim())}
          >
            <IconUrl size={22} fill={styles.url.color} style={styles.url}/>
          </TouchableOpacity>}
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
          </Text>,
        ];
      });
    }

    return render(value);
  }

  renderAvatar(fieldValue: User): Node {
    const user: User = ApiHelper.convertRelativeUrls([fieldValue], 'avatarUrl', getHUBUrl())[0];
    return (
      <Avatar
        testID="test:id/customFieldAvatar"
        accessibilityLabel="name"
        accessible={true}
        style={styles.colorMarker}
        key={user.id}
        userName={getEntityPresentation(user)}
        size={20}
        source={{uri: ((user.avatarUrl: any): string)}}
      />
    );
  }

  render(): Node {
    const {field, active} = this.props;
    return (
      <TouchableOpacity
        style={[styles.wrapper, active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>

        <View style={styles.keyWrapper}>
          <Text
            style={styles.keyText}
            testID="test:id/name"
            accessibilityLabel="name"
            accessible={true}
          >
            {this.getLabel()}
          </Text>
        </View>

        <View style={styles.valuesWrapper}>
          {this._renderColorMaker(((field.value: any): FieldValue))}
          {this._renderValue(field.value, this._getFieldType(field))}
        </View>


      </TouchableOpacity>
    );
  }
}
