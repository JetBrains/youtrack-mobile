import React from 'react';
import {ActivityIndicator, Pressable, PressableStateCallbackType, Text, View} from 'react-native';

import IssueVisibility from './issue-visibility';
import SelectSectioned, {SelectSectionedModal} from 'components/select/select-sectioned';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import {until} from 'util/util';

import styles from './comment-visibility-control.styles';

import type {User} from 'types/User';
import type {Visibility, VisibilityGroups, VisibilityItem} from 'types/Visibility';
import {Entity} from 'types/Entity';
import {IssueComment} from 'types/CustomFields';
import {TextStyleProp} from 'types/Internal';
import {UserGroup} from 'types/UserGroup';
import {getGroupedData, getVisibilityPresentation} from 'components/visibility/visibility-helper';
import {visibilityArticleDefaultText, visibilityDefaultText} from 'components/visibility/visibility-strings';

const CommentVisibilityControl = ({
  commentId,
  entity,
  forceChange,
  onUpdate,
  style,
  visibility,
}: {
  commentId: string;
  entity: Entity;
  forceChange?: boolean;
  onUpdate: () => void;
  style?: TextStyleProp;
  visibility: Visibility | null;
}) => {
  const [isSelectVisible, setSelectVisible] = React.useState<boolean>(false);
  const [curVisibility, setCurVisibility] = React.useState<Visibility | null>(visibility);
  const [isDisabled, setDisabled] = React.useState<boolean>(false);

  const getVisibilityOptions = async (q: string = ''): Promise<VisibilityGroups> => {
    const api = getApi();
    const [error, options] = await until<VisibilityGroups>(
      hasType.issue(entity)
        ? api.issue.getVisibilityOptions(entity.id, q)
        : api.articles.getVisibilityOptions(entity.id)
    );
    return error ? {} : options;
  };

  const updateVisibility = async (v: Visibility | null) => {
    const api = getApi();
    const resource = hasType.issue(entity) ? api.issue.setCommentVisibility : api.articles.setCommentVisibility;
    setDisabled(true);
    const [error, updatedComment] = await until<IssueComment>(resource(v, entity.id, commentId));
    if (!error) {
      onUpdate();
      setCurVisibility(updatedComment.visibility!);
    }
    setDisabled(false);
  };

  const onSelect = (selected: VisibilityItem[]) => {
    const permittedGroups = selected.filter(it => hasType.userGroup(it)) as UserGroup[];
    const permittedUsers = selected.filter(it => hasType.user(it)) as User[];
    updateVisibility({...visibility, ...IssueVisibility.visibility({permittedGroups, permittedUsers})});
    setSelectVisible(false);
  };

  const getVisibilitySelectedItems = () => {
    return curVisibility
      ? ([] as VisibilityItem[])
          .concat(curVisibility?.permittedGroups || [])
          .concat(curVisibility?.permittedUsers || [])
      : [];
  };

  const getItemTitle = (item: VisibilityItem) => getEntityPresentation(item);

  const renderSelect = () => {
    const Component = (isSplitView() ? SelectSectionedModal : SelectSectioned) as React.ElementType;
    return (
      <Component
        multi={true}
        emptyValue={null}
        placeholder={i18n('Filter users, groups, and teams')}
        selectedItems={getVisibilitySelectedItems()}
        getTitle={getItemTitle}
        dataSource={async (q: string) => getGroupedData(await getVisibilityOptions(q))}
        onSelect={onSelect}
        onCancel={() => setSelectVisible(false)}
      />
    );
  };

  const renderPopupContent = () => {
    const presentation = getVisibilityPresentation(
      visibility,
      hasType.issue(entity) ? visibilityDefaultText() : visibilityArticleDefaultText(),
      true
    );
    const btnTextStyle = [styles.actionText, isDisabled && styles.actionTextDisabled];
    const btnStyle = ({pressed}: PressableStateCallbackType) => [styles.action, pressed && {opacity: 0.5}];
    return (
      <View>
        {isDisabled && <ActivityIndicator style={styles.progress} color={styles.actionText.color} />}
        <View style={styles.action}>
          <Text style={styles.headerText}>{i18n('Visible to {{presentation}}', {presentation})}</Text>
        </View>

        <View style={styles.rowSeparator} />
        <Pressable disabled={isDisabled} style={btnStyle} onPress={() => updateVisibility(null)}>
          <Text style={btnTextStyle}>{i18n('Reset visibility')}</Text>
        </Pressable>

        <View style={styles.rowSeparator} />
        <Pressable disabled={isDisabled} style={btnStyle} onPress={() => setSelectVisible(true)}>
          <Text style={btnTextStyle}>{i18n('Select users, groups, and teams')}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View testID="test:id/commentVisibilityControl" accessibilityLabel="commentVisibilityControl" style={style}>
      {!forceChange && renderPopupContent()}
      {(isSelectVisible || forceChange) && renderSelect()}
    </View>
  );
};

export default React.memo(CommentVisibilityControl);
