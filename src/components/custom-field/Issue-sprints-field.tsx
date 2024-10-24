import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useSelector} from 'react-redux';

import Router from 'components/router/router.tsx';
import {getIssueState} from 'views/issue';
import {i18n} from 'components/i18n/i18n.ts';
import {IssueSprint} from 'types/Issue.ts';

import styles from './custom-field.styles';

import type {AppState} from 'reducers';

export default function IssueSprintsField() {
  const issueSprints = useSelector((state: AppState) => getIssueState(state).issueSprints);

  return issueSprints.length > 0 ? (
    <View style={styles.wrapper}>
      <View style={styles.keyWrapper} accessible={false}>
        <Text style={styles.keyText} testID="test:id/name" accessible={true}>
          {i18n('Boards')}
        </Text>
      </View>

      <View style={styles.valuesWrapper} accessible={false}>
        {issueSprints.map((sprint: IssueSprint) => {
          const text = `${sprint.agile.name} ${sprint.name}`;
          return (
            <TouchableOpacity
              key={text}
              style={styles.valueTag}
              onPress={() => {
                Router.AgileBoard({agileId: sprint.agile.id, sprintId: sprint.id});
              }}
            >
              <Text style={styles.valueTagText}>{text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  ) : null;
}
