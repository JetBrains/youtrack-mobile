import React from 'react';

import {TextInput, View} from 'react-native';

import Select, {ISelectProps, ISelectState} from 'components/select/select';

import styles from 'components/select/select.styles';

export interface ISelectWithCustomInput extends ISelectProps {
  customInput?: string | undefined;
  customInputPlaceholder?: string;
  onSelect: (item: any | any[]) => void;
}

export default class SelectWithCustomInput extends Select<ISelectWithCustomInput, ISelectState & {customInputText?: string}> {
  renderInputValueItem() {
    return this.props.customInput !== undefined ? (
      <View>
        <TextInput
          placeholder={this.props.customInputPlaceholder}
          style={[styles.customInput, styles.headerText]}
          value={this.state.customInputText}
          onSubmitEditing={e => {
            this.props.onSelect(e.nativeEvent.text);
          }}
          onChangeText={(text: string) => {
            this.setState({customInputText: text});
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
