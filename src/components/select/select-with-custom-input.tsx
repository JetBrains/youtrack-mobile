import React from 'react';

import {TextInput, View} from 'react-native';

import Select, {ISelectProps, ISelectState} from 'components/select/select';

import styles from 'components/select/select.styles';

export interface ISelectWithCustomInput extends ISelectProps {
  customInput?: string | undefined;
  customInputPlaceholder?: string;
}

export default class SelectWithCustomInput extends Select<
  ISelectWithCustomInput,
  ISelectState & {customInput?: string}
> {
  constructor(props: ISelectWithCustomInput) {
    super(props);
    this.state = {...this.state, customInput: props.customInput};
  }

  renderInputValueItem() {
    return this.state.customInput !== undefined ? (
      <View>
        <TextInput
          placeholder={this.props.customInputPlaceholder}
          style={[styles.customInput, styles.headerText]}
          value={this.state.customInput}
          onSubmitEditing={e => {
            this.props.onSelect(e.nativeEvent.text);
          }}
          onChangeText={(text: string) => {
            this.setState({customInput: text});
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
