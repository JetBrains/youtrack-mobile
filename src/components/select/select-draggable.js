/* @flow */

import React from 'react';

import DraggableFlatList from 'react-native-draggable-flatlist';
import type {RenderItemParams} from 'react-native-draggable-flatlist';

import Select from './select';

import type {Node} from 'React';
import SelectItem from './select__item';
import {Text} from 'react-native';


//$FlowFixMe
export default class SelectDraggable extends Select {

  renderPlaceholder: ((any) => Node) = () => {
    return <Text>'PLACEHOLDER'</Text>;
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
