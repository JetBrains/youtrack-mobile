/* @flow */

import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import ColorField from '../../components/color-field/color-field';
import PropTypes from 'prop-types';
import {showActions} from '../action-sheet/action-sheet';

import styles from './tags.styles';

import type {Tag} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => void,
  onTagRemove?: (id: string) => void,
  style?: ViewStyleProp,
  title?: React$Element<any>,
  multiline?: boolean
}

type DefaultProps = {
  onTagPress: () => any,
}

const NO_COLOR_CODING_ID = '0';

export default class Tags extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onTagPress: () => {}
  };
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  getContextActions(tag: Tag) {
    const actions: Array<{ title: string, execute?: () => any }> = [
      {
        title: `Show all issues tagged with "${tag.name}"...`,
        execute: () => this.props.onTagPress(tag.query)
      }
    ];
    if (this.props.onTagRemove) {
      actions.push({
        title: 'Remove tag',
        execute: () => this.props.onTagRemove && this.props.onTagRemove(tag.id)
      });
    }
    actions.push({title: 'Cancel'});
    return actions;
  }

  getSelectedActions(tag: Tag) {
    return showActions(
      this.getContextActions(tag),
      this.context.actionSheet()
    );
  }

  async showContextActions(tag: Tag) {
    const selectedAction = await this.getSelectedActions(tag);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  }

  isDefaultColorCoding = (tag: Tag) => tag?.color.id === NO_COLOR_CODING_ID ? styles.tagNoColor : null;

  render() {
    const {tags, multiline, title, style} = this.props;

    if (!tags || !tags.length) {
      return null;
    }

    const tagStyle = [styles.tag, multiline ? styles.tagMultiline : null];

    return (
      <View
        testID="tagsList"
        style={[styles.tags, multiline ? styles.tagsMultiline : null, style]}
      >
        {title}

        {tags.map((tag, index) => {
          return (
            <TouchableOpacity
              testID="tagsListTag"
              onPress={() => this.showContextActions(tag)}
              key={`${tag.id}_button`}
            >
              <ColorField
                testID="tagColor"
                style={[tagStyle, index === 0 ? {marginLeft: 0} : null]}
                text={tag.name}
                color={tag.color}
                defaultColorCoding={this.isDefaultColorCoding(tag) ? styles.tagNoColor : null}
                fullText={true}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
