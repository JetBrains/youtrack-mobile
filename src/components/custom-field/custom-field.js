import {TouchableOpacity, View, Text, StyleSheet, Platform} from 'react-native';
import React, {PropTypes} from 'react';
import {COLOR_FONT_GRAY, COLOR_PINK, COLOR_FONT} from '../variables/variables';

export default class CustomField extends React.Component {
  _getValue(value) {
    const field = this.props.field;
    const emptyValue = field.projectCustomField.emptyFieldText;

    if (value) {
      if (Number.isInteger(value)) {
        return new Date(value).toLocaleDateString();
      }
      return value.name || value.fullName || value.login || value.presentation;
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
    return {
      color: value.color.foreground,
      backgroundColor: value.color.background
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
        style={[styles.wrapper, this.props.active ? styles.wrapperActive : null]}
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
        <View style={styles.valuesWrapper}>{this._renderValue(this.props.field.value)}</View>
        <Text style={[styles.keyText, this.props.disabled ? styles.valueTextDisabled : null]} testID="name">{this._getKey()}</Text>
      </TouchableOpacity>
    );
  }
}

const SELECTED_ALPHA_HEX = 20;

const styles = StyleSheet.create({
  wrapper: {
    padding: 8
  },
  wrapperActive: {
    backgroundColor: `${COLOR_PINK}${SELECTED_ALPHA_HEX}`
  },
  valuesWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  keyText: {
    color: COLOR_FONT,
    paddingTop: 4,
    fontSize: 12
  },
  valueText: {
    color: COLOR_FONT,
    fontWeight: 'bold',
    marginRight: 0,
    padding: 2,
    ...Platform.select({
      ios: {
        marginLeft: -2
      },
      android: {
        paddingRight: -1
      }
    })
  },
  valueTextDisabled: {
    color: COLOR_FONT_GRAY
  }
});

CustomField.propTypes = {
  field: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  active: PropTypes.bool
};
