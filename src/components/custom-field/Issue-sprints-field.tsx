import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useSelector} from 'react-redux';
import {useDispatch} from 'hooks/use-dispatch';

import Router from 'components/router/router';
import Select from 'components/select/select';
import {BoardOnIssue, SprintOnIssue} from 'types/Agile';
import {getIssueActions, getIssueState} from 'views/issue';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAdd, IconAngleRight, IconBack} from 'components/icon/icon';

import styles from './custom-field.styles';

import type {ActionSheetAction} from 'types/Action';
import type {AppState} from 'reducers';
import type {IssueSprint} from 'types/Issue';

export default function IssueSprintsField({projectId, onUpdate}: {projectId: string; onUpdate: () => void}) {
  const dispatch = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();

  const issueSprints = useSelector((state: AppState) => getIssueState(state).issueSprints);
  const issueId = useSelector((state: AppState) => getIssueState(state).issueId);

  const loadBoards = React.useCallback(
    async (q: string): Promise<BoardOnIssue[]> => await dispatch(getIssueActions().getIssueBoards(q)),
    [dispatch]
  );

  const loadSprints = React.useCallback(
    async (boardId: string): Promise<SprintOnIssue[]> => await dispatch(getIssueActions().getIssueSprints(boardId)),
    [dispatch]
  );

  const removeFromSprint = React.useCallback(
    async (boardId: string, sprintId: string) => {
      try {
        await dispatch(getIssueActions().removeIssueFromSprint(boardId, sprintId, issueId));
        onUpdate();
      } catch (e) {}
    },
    [dispatch, issueId, onUpdate]
  );

  const addToBoard = React.useCallback(
    async (boardName: string, sprintName: string | null) => {
      await dispatch(getIssueActions().addIssueToSprint(issueId, boardName, sprintName));
      onUpdate();
      Router.pop();
    },
    [dispatch, issueId, onUpdate]
  );

  const sprintSelectTitleRenderer = (b: BoardOnIssue) => (
    <View style={styles.selectItem}>
      <Text style={styles.valueTagText}>{b.name}</Text>
    </View>
  );

  const selectBoardTitleRenderer = (b: BoardOnIssue) => (
    <View style={styles.selectItem}>
      <Text style={styles.valueTagText}>{b.name}</Text>
      {!b.sprintsSettings.disableSprints && (
        <View style={styles.selectItemSecondary}>
          <Text style={styles.selectItemSecondaryText}>{i18n('select sprint')}</Text>
          <IconAngleRight size={24} color={styles.selectItemSecondaryText.color} />
        </View>
      )}
    </View>
  );

  const renderSprintList = (board: BoardOnIssue) => {
    return (
      <Select
        closeIcon={IconBack}
        getWrapperComponent={() => View}
        dataSource={async (query: string) => {
          const sprints: SprintOnIssue[] = await loadSprints(board.id);
          return sprints
            .filter(s => !issueSprints.find(is => is.id === s.id))
            .filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
        }}
        onSelect={(s: SprintOnIssue) => {
          addToBoard(board.name, s.name);
        }}
        onCancel={() => Router.pop()}
        selectedItems={[]}
        titleRenderer={sprintSelectTitleRenderer}
      />
    );
  };

  const renderBoardList = () => {
    return (
      <Select
        closeIcon={IconBack}
        getWrapperComponent={() => View}
        dataSource={async (q: string) => {
          const boards = await loadBoards(q);
          return boards
            .filter(b => b.projects.map(i => i.id).includes(projectId))
            .filter(b => b.name.toLowerCase().includes(q.toLowerCase()));
        }}
        onSelect={b => {
          if (!b.sprintsSettings.disableSprints) {
            Router.Page({children: renderSprintList(b)});
          } else {
            addToBoard(b.name, null);
          }
        }}
        onCancel={() => Router.pop()}
        selectedItems={[]}
        titleRenderer={selectBoardTitleRenderer}
      />
    );
  };

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
              onLongPress={() => {
                const options: ActionSheetAction[] = [
                  {
                    title: i18n('Remove'),
                    execute: () => removeFromSprint(sprint.agile.id, sprint.id),
                  },
                  {title: i18n('Cancel')},
                ];
                showActionSheetWithOptions(
                  {
                    options: options.map(it => it.title),
                    cancelButtonIndex: 1,
                  },
                  index => options[index as number]?.execute?.()
                );
              }}
            >
              <Text style={styles.valueTagText}>{text}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          style={styles.valueAddIcon}
          onPress={() => Router.Page({children: renderBoardList()})}
        >
          <IconAdd size={20} />
        </TouchableOpacity>
      </View>
    </View>
  ) : null;
}
