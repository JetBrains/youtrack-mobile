/* @flow */

import React from 'react';

import ColorField from '../color-field/color-field';

import Select from '../select/select';
import {getApi} from '../api/api__instance';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {until} from '../../util/util';

import API from '../api/api';

import styles from './tags.styles';

import type {Tag} from '../../flow/CustomFields';

type Props = {
  existed: Array<Tag>,
  onAdd: (tags: Array<Tag>) => any,
  onHide: () => void,
  projectId: string
}


const TagAddSelect = (props: Props) => {
  const {onAdd, onHide, projectId, existed = []} = props;
  const api: API = getApi();
  const selectProps = {
    placeholder: 'Filter tags',
    multi: true,
    dataSource: async () => {
      const [error, relevantTags] = await until(api.issueFolder.getProjectRelevantTags(projectId));
      return error ? [] : relevantTags;
    },
    selectedItems: existed,
    getTitle: (tag: Tag) => getEntityPresentation(tag),
    onCancel: onHide,
    onSelect: async (tags: ?Array<Tag>) => {
      await onAdd(tags || []);
      onHide();
    },
    titleRenderer: (tag: Tag) => {
      return (
        <ColorField
          fullText={true}
          text={tag.name}
          color={tag.color}
          style={styles.tagSelectItem}
        />
      );
    },
  };

  return <Select {...selectProps} />;
};
export default React.memo<Props>(TagAddSelect);
