/* @flow */

import React, {useState} from 'react';
import {TextInput, View} from 'react-native';

import {IconSearch} from '../../components/icon/icon';
import {iconClearText} from '../../components/icon/icon-clear-text';

import styles from './knowledge-base.styles';

type Props = {
  onSearch: (query: string) => void
};


const KnowledgeBaseSearchPanel = (props: Props) => {
  let searchInput: Object | null = null;

  const [query, updateQuery] = useState('');
  const [focus, updateFocus] = useState(false);

  const focusInput = () => searchInput && searchInput.focus && searchInput.focus();

  return (
    <View style={styles.searchPanelContainer}>
      {Boolean(!focus && !query) &&
      <IconSearch size={20} color={styles.icon.color}/>
      }

      <TextInput
        ref={(instance: ?Object) => {if (instance) searchInput = instance;}}

        style={styles.searchInput}

        placeholderTextColor={styles.clearIcon.color}
        placeholder="Filter articles by title"

        clearButtonMode="never"
        returnKeyType="search"
        autoFocus={false}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        autoCapitalize="none"

        onFocus={() => updateFocus(true)}
        onBlur={() => updateFocus(false)}

        onSubmitEditing={() => props.onSearch(query)}
        onChangeText={(q: string) => updateQuery(q)}
        value={query}
      />

      {!!query && iconClearText(
        () => {
          updateQuery('');
          focusInput();
        },
        styles.clearIcon.color
      )}

    </View>
  );

};

export default React.memo<Props>(KnowledgeBaseSearchPanel);
