/* @flow */

import {View, TouchableOpacity, Image, ScrollView} from 'react-native';
import React, {PureComponent} from 'react';

import type {Tag} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import ColorField from '../../components/color-field/color-field';
import {closeOpaque, next} from '../../components/icon/icon';

import styles from './tags.styles';
import ModalView from '../modal-view/modal-view';
import {showActions} from '../action-sheet/action-sheet';
import PropTypes from 'prop-types';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => any,
  style?: ViewStyleProp,
  title?: React$Element<any>,
  showMore?: boolean
}

type DefaultProps = {
  onTagPress: () => any,
}

type State = {
  showAllTags: boolean
}

export default class Tags extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    onTagPress: () => {
    }
  };
  static contextTypes = {
    actionSheet: PropTypes.func
  };
  hitSlop = ['top', 'left', 'bottom', 'right'].reduce((data, key) => Object.assign(data, {[key]: 12}), {});

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
    const {tags, style, showMore} = this.props;

    if (!tags || !tags.length) {
      return null;
    }

    const onShowAllToggle = () => this._toggleShowAll();

    return (
      <View
        testID="tagsContainer"
        style={[styles.container, style]}
      >
        {this._renderTags()}

        {showMore && <TouchableOpacity
          testID="tagsShowMore"
          style={styles.showMore}
          onPress={onShowAllToggle}
        >
          <Image style={styles.showMoreIcon} source={next}/>
        </TouchableOpacity>}

        {this.state.showAllTags &&
        <ModalView
          testID="tagsModal"
          style={styles.modal}>
          {this._renderTags(true)}

          <TouchableOpacity
            testID="tagsModalClose"
            style={styles.closeButton}
            onPress={onShowAllToggle}
            hitSlop={this.hitSlop}
          >
            <Image style={styles.closeIcon} source={closeOpaque}/>
          </TouchableOpacity>
        </ModalView>}

      </View>
    );
  }
}
