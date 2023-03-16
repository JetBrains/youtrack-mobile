import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import ColorField from 'components/color-field/color-field';
import {i18n} from 'components/i18n/i18n';
import {showActions} from '../action-sheet/action-sheet';
import styles from './tags.styles';
import type {ActionSheetOption} from '../action-sheet/action-sheet';
import type {Tag} from 'types/CustomFields';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  tags: Tag[];
  onTagPress: (query: string) => void;
  onTagRemove?: (id: string) => void;
  style?: ViewStyleProp;
  multiline?: boolean;
};
type DefaultProps = {
  onTagPress: () => any;
};
const NO_COLOR_CODING_ID = '0';


export default class Tags extends PureComponent<Props, Readonly<{}>> {
  static defaultProps: DefaultProps = {
    onTagPress: () => {},
  };
  static contextTypes: any = {
    actionSheet: Function,
  };

  getContextActions(
    tag: Tag,
  ): Array<{
    execute?: () => any;
    title: string;
  }> {
    const actions: Array<{
      title: string;
      execute?: () => any;
    }> = [
      {
        title: i18n('Show all issues tagged with "{{tagName}}"...', {
          tagName: tag.name,
        }),
        execute: () => this.props.onTagPress(tag.query),
      },
    ];

    if (this.props.onTagRemove) {
      actions.push({
        title: i18n('Remove tag'),
        execute: () => this.props.onTagRemove && this.props.onTagRemove(tag.id),
      });
    }

    actions.push({
      title: i18n('Cancel'),
    });
    return actions;
  }

  getSelectedActions(tag: Tag): Promise<ActionSheetOption | null | undefined> {
    return showActions(this.getContextActions(tag), this.context.actionSheet());
  }

  async showContextActions(tag: Tag) {
    const selectedAction = await this.getSelectedActions(tag);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  }

  isDefaultColorCoding: (tag: Tag) => any | null = (tag: Tag) =>
    tag?.color?.id === NO_COLOR_CODING_ID ? styles.tagNoColor : null;

  render(): React.ReactNode {
    const {tags, multiline, style} = this.props;

    if (!tags || tags?.length === 0) {
      return null;
    }

    return (
      <View
        testID="test:id/tagsList"
        accessibilityLabel="tagsList"
        accessible={true}
        style={[styles.tags, multiline ? styles.tagsMultiline : null, style]}
      >
        {(tags || []).map((tag: Tag) => {
          return (
            <TouchableOpacity
              style={[styles.tag, multiline ? styles.tagMultiline : null]}
              testID="test:id/tagsListTag"
              accessibilityLabel="tagsListTag"
              accessible={true}
              onPress={() => this.showContextActions(tag)}
              key={tag.id}
            >
              <ColorField
                testID="tagColor"
                text={tag.name}
                color={tag.color}
                defaultColorCoding={
                  this.isDefaultColorCoding(tag) ? styles.tagNoColor : null
                }
                fullText={true}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
