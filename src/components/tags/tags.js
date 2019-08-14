/* @flow */

import {View, TouchableOpacity, ScrollView, Text} from 'react-native';
import React, {PureComponent} from 'react';

import ColorField from '../../components/color-field/color-field';
import LineBlock from '../line-block/line-block';
import {showActions} from '../action-sheet/action-sheet';
import PropTypes from 'prop-types';

import styles from './tags.styles';

import type {Tag} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => any,
  style?: ViewStyleProp,
  title?: React$Element<*>,
  inline?: boolean
}

type DefaultProps = {
  onTagPress: () => any,
}

type State = {
  showAllTags: boolean
}

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

  _getTagSpecificStyle(tag: Tag) {
    return tag?.color.id === '0' ? styles.tagNoColor : null;
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

  _renderTags(multiline?: boolean) {
    const {tags, title} = this.props;
    const tagStyle = [styles.tag, multiline ? styles.tagMultiline : null];

    return (
      <View
        testID="tagsList"
        style={styles.tagsContainer}
      >
        {title}

        <ScrollView
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[styles.tagsContainer, multiline ? styles.tagsContainerAll : null]}
          >
            {tags.map(tag => {
              return (
                <TouchableOpacity
                  testID="tagsListTag"
                  onPress={() => this._showActions(tag)}
                  key={`${tag.id}_button`}
                >
                  <ColorField
                    testID="tagColor"
                    style={[tagStyle, this._getTagSpecificStyle(tag)]}
                    text={tag.name}
                    color={tag.color}
                    fullText={true}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  render() {
    const {tags, inline} = this.props;

    if (!tags || !tags.length) {
      return null;
    }

    return (
      <LineBlock
        style={styles.tagsContainer}
        testID="tagsListContainer"
        inline={inline}
        title={<Text>{`Tags: `}</Text>}
        childrenRenderer={() => this._renderTags()}
        allChildrenRenderer={() => this._renderTags(true)}
      />
    );
  }
}
