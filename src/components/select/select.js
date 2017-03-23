/* @flow */
import {Text, Image, ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import React from 'react';
import styles from './select.styles';
import ColorField from '../color-field/color-field';
import {notifyError} from '../notification/notification';
import {checkWhite} from '../icon/icon';
import {COLOR_PLACEHOLDER, UNIT} from '../variables/variables';
import getTopPadding, {onHeightChange} from '../header/header__top-padding';

const MAX_VISIBLE_ITEMS = 100;

export type Props = {
  dataSource: (query: string) => Promise<Array<Object>>,
  onSelect: (item: ?Object | Array<Object>) => any,
  onChangeSelection: (selectedItems: Array<Object>) => any,
  onCancel: () => any,
  getTitle: (item: Object) => string,
  getValue?: (item: Object) => string,
  selectedItems: Array<Object>,
  placeholder?: string,
  multi: boolean,
  autoFocus: boolean,
  emptyValue: ?string,
  style?: any
};

type State = {
  query: string,
  items: ?Array<Object>,
  filteredItems: Array<Object>,
  selectedItems: Array<Object>,
  loaded: boolean
};

export default class Select extends React.Component {
  props: Props;
  state: State;

  static defaultProps = {
    placeholder: 'Search item',
    autoFocus: false,
    onChangeSelection: (items) => null
  };

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

  componentDidUpdate(prevProps: Props) {
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

  _renderEmptyValueItem() {
    if (!this.props.emptyValue) {
      return;
    }
    return (
      <TouchableOpacity key={this.props.emptyValue} style={styles.row} onPress={() => this._onClearValue()}>
        <Text style={[styles.itemTitle, {marginLeft: 0}]}>{this.props.emptyValue}</Text>

        {this.state.selectedItems.length === 0 && <Image source={checkWhite} style={styles.selectedMarkIcon}/>}
      </TouchableOpacity>
    );
  }

  _onSearch(query) {
    query = query || '';
    const {getValue, getTitle} = this.props;

    const filteredItems = (this.state.items || []).filter(item => {
      const label = (getValue && getValue(item)) || getTitle(item) || '';
      return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    })
      .slice(0, MAX_VISIBLE_ITEMS);

    this.setState({filteredItems});
  }

  _renderTitle(item) {
    if (item.color) {
      return <View style={styles.colorFieldItemWrapper}>
        <ColorField text={this.props.getTitle(item)} color={item.color} style={styles.colorField}/>
        <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>
      </View>;
    }
    return <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>;
  }

  _isSelected(item) {
    return this.state.selectedItems.some(selectedItem => item.id === selectedItem.id);
  }

  _onTouchItem(item) {
    if (!this.props.multi) {
      return this.props.onSelect(item);
    }

    const selectedItems = this._isSelected(item)
      ? this.state.selectedItems.filter(it => it.id !== item.id)
      : this.state.selectedItems.concat(item);

    this.setState({selectedItems});
    this.props.onChangeSelection(selectedItems);
  }

  _onClearValue() {
    const emptyValue = this.props.multi ? [] : null;
    return this.props.onSelect(emptyValue);
  }

  _onSave() {
    return this.props.onSelect(this.state.selectedItems);
  }

  _renderRow(item) {
    return (
      <TouchableOpacity key={item.id} style={styles.row} onPress={() => this._onTouchItem(item)}>
        <View style={styles.selectItemValue}>
          {item.avatarUrl && <Image style={styles.itemIcon} source={{uri: item.avatarUrl}}/>}

          {this._renderTitle(item)}
        </View>

        {this._isSelected(item) && <Image source={checkWhite} style={styles.selectedMarkIcon}></Image>}
      </TouchableOpacity>
    );
  }

  render() {
    const {multi, autoFocus, style, placeholder, onCancel} = this.props;

    return (
      <View style={[styles.container, style, {paddingTop: getTopPadding() - UNIT * 2}]}>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder={placeholder}
            keyboardAppearance="dark"
            autoFocus={autoFocus}
            placeholderTextColor={COLOR_PLACEHOLDER}
            returnKeyType={multi ? 'done' : 'search'}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            onSubmitEditing={(e) => multi ? this._onSave() : this._onSearch(this.state.query)}
            value={this.state.query}
            onChangeText={(text) => {
              this.setState({query: text});
              this._onSearch(text);
            }}
            style={styles.searchInput}/>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag">
          {this._renderEmptyValueItem()}
          {this.state.filteredItems.map(item => this._renderRow(item))}

          {!this.state.loaded && <View style={[styles.row, styles.loadingRow]}>
            <ActivityIndicator/>
            <Text style={styles.loadingMessage}>Loading values...</Text>
          </View>}
        </ScrollView>
      </View>
    );
  }
}
