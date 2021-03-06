/* @flow */
import {Text, View, TouchableOpacity, TextInput, ActivityIndicator, FlatList} from 'react-native';
import React, {Component} from 'react';

import ColorField from '../color-field/color-field';
import {notifyError} from '../notification/notification';
import ModalView from '../modal-view/modal-view';
import {onHeightChange} from '../header/header__top-padding';
import {IconCheck, IconBack} from '../icon/icon';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import SelectItem from './select__item';

import styles, {SELECT_ITEM_HEIGHT, SELECT_ITEM_SEPARATOR_HEIGHT} from './select.styles';

export type SelectProps = {
  dataSource: (query: string) => Promise<Array<Object>>,
  onSelect: (item: ?Object | Array<Object>) => any,
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

export default class Select extends Component<SelectProps, SelectState> {
  static defaultProps = {
    placeholder: 'Filter item',
    autoFocus: false,
    onChangeSelection: (items: Array<Object>) => null,
    noFilter: false,
    getTitle: (item: Object) => getEntityPresentation(item),
    header: () => null
  };

  static getItemLayout(items: ?Array<Object>, index: number) {
    const height = SELECT_ITEM_HEIGHT;
    const offset = (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index;
    return {
      length: height,
      offset: offset,
      index
    };
  }

  static renderSeparator() {
    return <View style={styles.rowSeparator}/>;
  }

  constructor() {
    super();
    this.state = {
      query: '',
      items: null,
      filteredItems: [],
      selectedItems: [],
      loaded: false
    };
  }

  componentDidMount() {
    onHeightChange(() => this.forceUpdate());
    const selectedItems = this.props.selectedItems ? this.props.selectedItems : [];
    this.setState({selectedItems});
    this._loadItems(this.state.query);
  }

  componentDidUpdate(prevProps: SelectProps) {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.setState({
        loaded: false,
        filteredItems: [],
        items: null,
        selectedItems: this.props.selectedItems || []
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

  renderEmptyValueItem() {
    const {emptyValue} = this.props;

    if (!emptyValue) {
      return;
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

    const filteredItems = (this.state.items || []).filter(item => {
      const label = (getValue && getValue(item)) || getTitle(item) || '';
      return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    this.setState({filteredItems});
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

  onClearValue = () => {
    return this.props.onSelect(this.props.multi ? [] : null);
  }

  _onSave() {
    return this.props.onSelect(this.state.selectedItems);
  }

  getItemLayout(items: ?Array<Object>, index: number) {
    return {
      length: SELECT_ITEM_HEIGHT,
      offset: (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index,
      index
    };
  }

  renderItem = ({item}: Object) => {
    return (
      <SelectItem
        item={item}
        isSelected={this.state.selectedItems.some(selectedItem => item.id === selectedItem.id)}
        onPress={() => this._onTouchItem(item)}
        titleRenderer={() => this.props.titleRenderer ? this.props.titleRenderer(item) : this._renderTitle(item)}
      />
    );
  };

  renderItems() {
    return (
      <FlatList
        testID="selectItems"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"

        ListHeaderComponent={this.renderEmptyValueItem()}
        scrollEventThrottle={50}

        data={this.state.filteredItems}
        keyExtractor={(item: Object) => item.key || item.ringId || item.id}
        renderItem={this.renderItem}

        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}

        extraData={this.state.selectedItems}
      />
    );
  }

  render() {
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
