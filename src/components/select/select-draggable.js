/* @flow */

import React from 'react';

import DraggableFlatList from 'react-native-draggable-flatlist';

import Select from './select';
import SelectItem from './select__item';
import {i18n} from '../i18n/i18n';
import {Text} from 'react-native';

import type {Node} from 'React';
import type {RenderItemParams} from 'react-native-draggable-flatlist';


//$FlowFixMe
export default class SelectDraggable extends Select {

  renderPlaceholder: ((any) => Node) = () => {
    return <Text>{i18n('\'PLACEHOLDER\'')}</Text>;
  }

  renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
    return (
      <SelectItem
        style={{ backgroundColor: isActive && 'red' }}
        onLongPress={drag}
        disabled={isActive}
        item={item}
        isSelected={this.state.selectedItems.some(selectedItem => item.id === selectedItem.id)}
        onPress={() => this._onTouchItem(item)}
        titleRenderer={() => this.props.titleRenderer ? this.props.titleRenderer(item) : this._renderTitle(item)}
      />
    );
  };


  renderItems(): Node {
    return (
      <DraggableFlatList
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"

        ListHeaderComponent={this.renderEmptyValueItem()}
        scrollEventThrottle={50}

        data={this.state.filteredItems}
        onDragEnd={({ data }) => {}}
        keyExtractor={this.getItemKey}
        renderItem={this.renderItem}
        // renderPlaceholder={this.renderPlaceholder}
        // initialNumToRender={this.state.filteredItems.length}

        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}

        extraData={this.state.selectedItems}
      />
    );
  }
}
