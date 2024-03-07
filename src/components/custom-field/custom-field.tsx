import React, {Component} from 'react';
import {TouchableOpacity, View, Text, Linking} from 'react-native';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import ColorField from 'components/color-field/color-field';
import CustomFieldSLA from 'components/custom-field/custom-field-sla';
import IconUrl from '@jetbrains/icons/new-window.svg';
import {absDate} from 'components/date/date';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getHUBUrl, isURLPattern} from 'util/util';
import {HIT_SLOP} from 'components/common-styles/button';
import {isSLAField} from 'components/custom-field/custom-field-helper';

import styles from './custom-field.styles';

import {
  CustomField as CustomFieldType,
  CustomFieldBase,
  FieldValue,
} from 'types/CustomFields';
import {User} from 'types/User';
import {CustomFieldValue} from 'types/CustomFields';

interface Props {
  field: CustomFieldType;
  onPress: () => unknown;
  disabled: boolean;
  active: boolean;
  absDate?: boolean;
}

const maxValueStringWidth: number = 30;

export default class CustomField extends Component<Props, void> {
  _getFieldType(field: CustomFieldType) {
    return field?.projectCustomField?.field?.fieldType?.valueType || null;
  }

  _getValue(
    value: CustomFieldValue | null,
    fieldType: string | null
  ): string | null {
    const field: CustomFieldType = this.props.field;
    const emptyValue: string | null =
      field?.projectCustomField?.emptyFieldText || '';

    if (value != null) {
      if (fieldType === 'date') {
        return absDate(value as unknown as number, true);
      }
      if (fieldType === 'date and time') {
        return absDate(value as unknown as number);
      }

      if (
        fieldType === 'integer' ||
        fieldType === 'string' ||
        fieldType === 'float'
      ) {
        return `${value}`;
      }

      return getEntityPresentation(value);
    }

    return emptyValue;
  }

  getLabel() {
    const field: CustomFieldType = this.props.field;
    const label: string =
      field?.projectCustomField?.field?.localizedName ||
      field?.localizedName ||
      field?.projectCustomField?.field?.name ||
      field?.name ||
      '';
    return label.length > maxValueStringWidth
      ? `${label.substring(0, maxValueStringWidth)}…`
      : label;
  }

  _renderColorMaker(value: CustomFieldValue | CustomFieldValue[] | null) {
    const firstColorCodedValue: FieldValue = value
      ? new Array().concat(value).find((fieldValue: FieldValue) => fieldValue.color) || null
      : null;
    return firstColorCodedValue ? (
      <ColorField
        style={styles.colorMarker}
        text={firstColorCodedValue.localizedName || firstColorCodedValue.name}
        color={firstColorCodedValue.color}
      />
    ) : null;
  }

  renderSLAValue(field: CustomFieldBase) {
    return <CustomFieldSLA field={field} absDate={this.props.absDate} />;
  }

  _renderValue(value: CustomFieldValue | CustomFieldValue[], fieldType: string | null) {
    const { active, disabled } = this.props;
    const textStyle = [
      styles.valueText,
      active && styles.valueTextActive,
      disabled && styles.valueTextDisabled,
    ];

    const render = (val: CustomFieldValue | null) => {
      const valuePresentation: string = this._getValue(val, fieldType) || '';
      return (
        <View style={styles.value} key="value" accessible={false}>
          {val && fieldType === 'user' ? this.renderAvatar(val as User) : null}
          <Text testID="test:id/value" accessible={true} style={textStyle}>
            {valuePresentation?.length > maxValueStringWidth
              ? `${valuePresentation.substring(0, maxValueStringWidth)}…`
              : valuePresentation}
          </Text>
          {isURLPattern(valuePresentation) && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => Linking.openURL(valuePresentation.trim())}
            >
              <IconUrl
                width={14}
                height={14}
                fill={styles.url.color}
                style={styles.url}
              />
            </TouchableOpacity>
          )}
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
          <Text style={textStyle} key={`cf-${ind}`}>
            {ind === value.length - 1 ? ' ' : ', '}
          </Text>,
        ];
      });
    }

    return render(value);
  }

  renderAvatar(fieldValue: User): React.ReactNode {
    const user = ApiHelper.convertRelativeUrls(
      [fieldValue],
      'avatarUrl',
      getHUBUrl()
    )[0] as User;
    return (
      <Avatar
        testID="test:id/customFieldAvatar"
        accessibilityLabel="name"
        accessible={true}
        style={styles.colorMarker}
        key={user.id}
        userName={getEntityPresentation(user)}
        size={20}
        source={{
          uri: user.avatarUrl,
        }}
      />
    );
  }

  render() {
    const { field, active } = this.props;
    const slaField = isSLAField(field);
    return (
      <TouchableOpacity
        style={[styles.wrapper, active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled || slaField}
        accessible={false}
      >
        <View style={styles.keyWrapper} accessible={false}>
          <Text style={styles.keyText} testID="test:id/name" accessible={true}>
            {this.getLabel()}
          </Text>
        </View>

        <View style={styles.valuesWrapper} accessible={false}>
          {this._renderColorMaker(field.value)}
          {slaField && this.renderSLAValue(field)}
          {!slaField && this._renderValue(field.value, this._getFieldType(field))}
        </View>
      </TouchableOpacity>
    );
  }
}
