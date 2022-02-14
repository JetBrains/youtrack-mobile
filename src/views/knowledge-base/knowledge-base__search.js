/* @flow */

import React, {useState} from 'react';
import {TextInput, View} from 'react-native';

import {IconSearch} from 'components/icon/icon';
import {iconClearText} from 'components/icon/icon-clear-text';

import styles from './knowledge-base.styles';

type Props = {
  onSearch: (query: string) => void,
  query: string | null
};


const KnowledgeBaseSearchPanel = (props: Props) => {
  const [searchQuery, updateQuery] = useState(props.query || '');
  const [focus, updateFocus] = useState(false);

  return (
    <View style={styles.searchPanelContainer}>
      {Boolean(!focus && !searchQuery) &&
      <IconSearch size={20} color={styles.icon.color}/>
      }

      <TextInput
        testID="test:id/knowledge-base-search-panel"
        accessibilityLabel="query-assist-input"
        accessible={true}

        style={styles.searchInput}

        placeholderTextColor={styles.clearIcon.color}
        placeholder="Search articles"

        clearButtonMode="never"
        returnKeyType="search"
        autoFocus={false}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        autoCapitalize="none"

        onFocus={() => updateFocus(true)}
        onBlur={() => updateFocus(false)}

        onSubmitEditing={() => props.onSearch(searchQuery)}
        onChangeText={(q: string) => updateQuery(q)}
        value={searchQuery}
      />

      {!!searchQuery && iconClearText(
        () => {
          updateQuery('');
          props.onSearch('');
        },
        styles.clearIcon.color
      )}

    </View>
  );

};

export default (React.memo<Props>(KnowledgeBaseSearchPanel): React$AbstractComponent<Props, mixed>);
