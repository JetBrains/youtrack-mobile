import React from 'react';
import {View, Text, FlatList} from 'react-native';

import SelectItem from 'components/select/select__item';
import {guid} from 'util/util';

import styles from './command-dialog.styles';

import type {CommandSuggestionResponse, CommandSuggestion} from 'types/Issue';

const CommandDialogSuggestions = ({
  suggestions,
  onApplySuggestion,
}: {
  suggestions: CommandSuggestionResponse;
  onApplySuggestion: (suggestion: CommandSuggestion) => void;
}) => {

  const rendererTitle = (item: CommandSuggestion & {title: string}) => (
    <View style={styles.suggestion}>
      <Text numberOfLines={2} style={styles.suggestionDescription}>
        {item.title}
      </Text>
      <Text numberOfLines={2} style={styles.suggestionText}>{item.option}</Text>
    </View>
  );

  const renderSuggestion = ({item}: {item: CommandSuggestion}) => {
    return (
      <SelectItem
        item={{...item, title: item.description, description: ''}}
        titleRenderer={rendererTitle}
        onPress={() => onApplySuggestion(item)}
      />
    );
  };

  return (
    <FlatList
      style={styles.suggestionsList}
      data={suggestions.suggestions}
      keyExtractor={guid}
      renderItem={renderSuggestion}
      keyboardShouldPersistTaps="handled"
    />
  );
};

export default React.memo(CommandDialogSuggestions);
