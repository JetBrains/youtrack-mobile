/* @flow */

import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import ColorField from '../../components/color-field/color-field';
import {showActions} from '../action-sheet/action-sheet';
import PropTypes from 'prop-types';

import styles from './tags.styles';

import type {Tag} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => any,
  style?: ViewStyleProp,
  title?: React$Element<any>,
  multiline?: boolean
}

type DefaultProps = {
  onTagPress: () => any,
}

type State = {
  showAllTags: boolean
}

const NO_COLOR_CODING_ID = '0';

export default class Tags extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    onTagPress: () => {}
  };
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {showAllTags: false};
  }

  _toggleShowAll() {
    this.setState({showAllTags: !this.state.showAllTags});
  }

  _getContextActions(tag: Tag) {
    return [{
      title: `Show all issues tagged with "${tag.name}"...`,
      execute: () => this.props.onTagPress(tag.query)
    }, {title: 'Cancel'}];
  }

  _getSelectedActions(tag: Tag) {
    return showActions(
      this._getContextActions(tag),
      this.context.actionSheet()
    );
  }

  async _showActions(tag: Tag) {
    const selectedAction = await this._getSelectedActions(tag);

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
              onPress={() => this._showActions(tag)}
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
