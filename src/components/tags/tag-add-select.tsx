import React from 'react';

import ColorField from 'components/color-field/color-field';
import Select from 'components/select/select';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {until} from 'util/util';

import styles from './tags.styles';

import type {ISelectProps} from 'components/select/select';
import type {Tag} from 'types/CustomFields';

interface Props {
  existed: Tag[];
  onAdd: (tags: Tag[]) => any;
  onHide: () => void;
  projectId: string;
  starId: string;
}

const TagAddSelect = (props: Props) => {
  const {onAdd, onHide, projectId, existed = []} = props;
  const selectProps: ISelectProps = {
    placeholder: i18n('Filter tags'),
    multi: true,
    dataSource: async (q: string) => {
      const [error, relevantTags] = await until(
        getApi().issueFolder.getProjectRelevantTags(projectId, q),
      );
      return error ? [] : relevantTags.filter((it: Tag) => it.id !== props.starId);
    },
    selectedItems: existed,
    getTitle: (tag: Tag) => getEntityPresentation(tag),
    onCancel: onHide,
    onSelect: async (tags: Tag[] | null) => {
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
