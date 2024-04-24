import React from 'react';

import {TextInput, View} from 'react-native';

import Select, {ISelectProps, ISelectState} from 'components/select/select';

import styles from 'components/select/select.styles';

export interface ISelectWithCustomInput extends ISelectProps {
  customInput?: string | undefined;
  customInputPlaceholder?: string;
  customInputValidator?: RegExp | ((v: string) => boolean) | null;
}

export default class SelectWithCustomInput extends Select<
  ISelectWithCustomInput,
  ISelectState & {customInput?: string, customInputError: boolean}
> {
  constructor(props: ISelectWithCustomInput) {
    super(props);
    this.state = {...this.state, customInput: props.customInput, customInputError: false};
  }

  renderInputValueItem() {
    const {onSelect, customInputValidator, customInputPlaceholder} = this.props;
    const {customInput, customInputError} = this.state;
    return customInput !== undefined ? (
      <View>
        <TextInput
          placeholder={customInputPlaceholder}
          style={[styles.customInput, styles.headerText, customInputError ? styles.error : null]}
          value={customInput}
          onSubmitEditing={e => {
            if (!customInputError) {
              onSelect(e.nativeEvent.text);
            }
          }}
          onChangeText={(text: string) => {
            let isInvalid = false;
            if (customInputValidator && text) {
              if (customInputValidator instanceof RegExp) {
                isInvalid = !customInputValidator.test(text);
              } else if (typeof customInputValidator === 'function') {
                isInvalid = !customInputValidator(text);
              }
            }
            this.setState({customInput: text, customInputError: isInvalid});
          }}
        />
      </View>
    ) : null;
  }

  renderListHeader() {
    return (
      <>
        {this.renderEmptyValueItem()}
        {this.renderInputValueItem()}
      </>
    );
  }
}
