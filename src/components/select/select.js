/* @flow */

import React, {Component} from 'react';
import {Text, View, TouchableOpacity, TextInput, ActivityIndicator, FlatList} from 'react-native';

import ColorField from '../color-field/color-field';
import ModalView from '../modal-view/modal-view';
import SelectItem from './select__item';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {IconCheck, IconBack} from '../icon/icon';
import {notifyError} from '../notification/notification';

import styles, {SELECT_ITEM_HEIGHT, SELECT_ITEM_SEPARATOR_HEIGHT} from './select.styles';

import type {Node} from 'React';

export type SelectProps = {
  dataSource: (query: string) => Promise<Array<Object>>,
  onSelect: (item: any) => any,
  onChangeSelection: (selectedItems: Array<Object>, current: Object) => any,
  onCancel: () => any,
  getTitle: (item: Object) => string,
  header?: () => any,
  titleRenderer?: (item: Object) => any,
  getValue?: (item: Object) => string,
  selectedItems: Array<Object>,
  placeholder?: string,
  multi: boolean,
  autoFocus?: boolean,
  emptyValue?: ?string,
  style?: any,
  noFilter?: boolean
};

type SelectState = {
  query: string,
  items: ?Array<Object>,
  filteredItems: Array<Object>,
  selectedItems: Array<Object>,
  loaded: boolean
};

type SelectItemsSortData = { selected: Array<Object>, other: Array<Object> };


export default class Select extends Component<SelectProps, SelectState> {
  static defaultProps: {
  autoFocus: boolean,
  getTitle: (item: any) => any,
  header: () => null,
  noFilter: boolean,
  onChangeSelection: (items: Array<any>) => null,
  placeholder: string,
} = {
    placeholder: 'Filter item',
    autoFocus: false,
    onChangeSelection: (items: Array<Object>) => null,
    noFilter: false,
    getTitle: (item: Object) => getEntityPresentation(item),
    header: () => null,
  };

  static getItemLayout(items: ?Array<Object>, index: number): {index: number, length: number, offset: number} {
    const height = SELECT_ITEM_HEIGHT;
    const offset = (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index;
    return {
      length: height,
      offset: offset,
      index,
    };
  }

  static renderSeparator(): Node {
    return <View style={styles.rowSeparator}/>;
  }

  constructor() {
    super();
    this.state = {
      query: '',
      items: null,
      filteredItems: [],
      selectedItems: [],
      loaded: false,
    };
  }

  getSortedItems = (items: Array<Object> = []) => {
    const selectedItemsKey: Array<string> = this.state.selectedItems.map((it: Object) => this.getItemKey(it));
    const sortData: SelectItemsSortData = items.reduce((data: SelectItemsSortData, item: Object) => {
      if (selectedItemsKey.includes(this.getItemKey(item))) {
        data.selected.push(item);
      } else {
        data.other.push(item);
      }
      return data;
    }, {
      selected: [],
      other: [],
    });

    return [].concat(sortData.selected).concat(sortData.other);
  }

  componentDidMount() {
    const selectedItems = this.props.selectedItems ? this.props.selectedItems : [];
    //TODO: remove setState from this hook, since it should trigger a second render
    this.setState({selectedItems});
    this._loadItems(this.state.query);
  }

  componentDidUpdate(prevProps: SelectProps) {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.setState({
        loaded: false,
        filteredItems: [],
        items: null,
        selectedItems: this.props.selectedItems || [],
      });
      this._loadItems(this.state.query);
    }
  }

  async _loadItems(query) {
    try {
      const items = await this.props.dataSource(query);
      this.setState({items});
      this._onSearch(query);
      this.setState({loaded: true});
    } catch (err) {
      notifyError('Failed to load values', err);
    }
  }

  renderEmptyValueItem(): React$Element<any> | null {
    const {emptyValue} = this.props;

    if (!emptyValue) {
      return null;
    }
    return (
      <View
        key={emptyValue}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={this.onClearValue}
        >
          <Text style={styles.itemTitle}>{emptyValue}</Text>

          {this.state.selectedItems.length === 0 && <IconCheck size={20} color={styles.link.color}/>}
        </TouchableOpacity>
        {Select.renderSeparator()}
      </View>
    );
  }

  _onSearch(query) {
    query = query || '';
    const {getValue, getTitle} = this.props;

    const filteredItems = (this.state.items || []).filter((item: any) => {
      const label: string = (getValue && getValue(item)) || getTitle(item) || '';
      return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    this.setState({filteredItems: this.getSortedItems(filteredItems)});
  }

  _renderTitle(item) {
    const label: React$Element<any> = <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>;

    if (item.color) {
      return (
        <View style={styles.colorFieldItemWrapper}>
          <ColorField
            text={this.props.getTitle(item)}
            color={item.color}
            style={styles.colorField}
          />
          {label}
        </View>
      );
    }

    return label;
  }

  _isSelected(item) {
    return this.state.selectedItems.some(selectedItem => item.id === selectedItem.id);
  }

  _onTouchItem(item) {
    if (!this.props.multi) {
      return this.props.onSelect(item);
    }

    let selectedItems = this._isSelected(item)
      ? this.state.selectedItems.filter(it => it.id !== item.id)
      : this.state.selectedItems.concat(item);

    if (item.toggleItem) {
      selectedItems = selectedItems.filter((it: Object) => {
        if (!it.toggleItem) {
          return it;
        }
        return it.id === item.id;
      });
    }

    this.setState({selectedItems});
    this.props.onChangeSelection(selectedItems, item);
  }

  onClearValue: (() => any) = () => {
    return this.props.onSelect(this.props.multi ? [] : null);
  }

  _onSave() {
    return this.props.onSelect(this.state.selectedItems);
  }

  getItemLayout(items: ?Array<Object>, index: number): {index: number, length: any, offset: number} {
    return {
      length: SELECT_ITEM_HEIGHT,
      offset: (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index,
      index,
    };
  }

  renderItem: ((any) => Node) = ({item}: Object) => {
    return (
      <SelectItem
        item={item}
        isSelected={this.state.selectedItems.some(selectedItem => item.id === selectedItem.id)}
        onPress={() => this._onTouchItem(item)}
        titleRenderer={() => this.props.titleRenderer ? this.props.titleRenderer(item) : this._renderTitle(item)}
      />
    );
  };

  getItemKey = (item: Object) => {
    return item.key || item.ringId || item.id;
  }

  renderItems(): Node {
    return (
      <FlatList
        testID="selectItems"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"

        ListHeaderComponent={this.renderEmptyValueItem()}
        scrollEventThrottle={50}

        data={this.state.filteredItems}
        keyExtractor={this.getItemKey}
        renderItem={this.renderItem}

        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}

        extraData={this.state.selectedItems}
      />
    );
  }

  render(): Node {
    const {multi, autoFocus, style, placeholder, onCancel, noFilter} = this.props;

    return (
      <ModalView
        testID="select"
        visible={true}
        animationType="slide"
        style={style}
      >
        {!noFilter && (
          <View style={styles.inputWrapper}>

            <TouchableOpacity
              testID="selectBackButton"
              onPress={onCancel}
            >
              <IconBack style={styles.cancelButton} color={styles.cancelButton.color}/>
            </TouchableOpacity>

            <TextInput
              testID="selectInput"
              placeholder={placeholder}
              autoFocus={autoFocus}
              placeholderTextColor={styles.placeholder.color}
              returnKeyType={multi ? 'done' : 'search'}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              onSubmitEditing={(e) => multi ? this._onSave() : this._onSearch(this.state.query)}
              value={this.state.query}
              onChangeText={(text) => {
                this.setState({query: text});
                this._onSearch(text);
              }}
              autoCapitalize="none"
              style={styles.searchInput}/>

            {multi && <TouchableOpacity
              testID="applyButton"
              style={styles.applyButton}
              onPress={() => this._onSave()}
            >
              <IconCheck size={20} color={styles.link.color}/>
            </TouchableOpacity>}

          </View>
        )}

        {!this.state.loaded && <View style={[styles.row, styles.loadingRow]}>
          <ActivityIndicator/>
          <Text style={styles.loadingMessage}>Loading values...</Text>
        </View>}
        {this.state.loaded && this.state?.items?.length === 0 && (
          <View style={[styles.row, styles.loadingRow]}>
            <Text style={styles.loadingMessage}>No items</Text>
          </View>
        )}

        {this.renderItems()}

      </ModalView>
    );
  }
}
