/* @flow */
import {Text, Image, ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import React from 'react';
import styles from './select.styles';
import Header from '../header/header';
import ColorField from '../color-field/color-field';
import {notifyError} from '../notification/notification';
import {COLOR_PLACEHOLDER} from '../variables/variables';

const MAX_VISIBLE_ITEMS = 100;

export type Props = {
  dataSource: (query: string) => Promise<Array<Object>>,
  onSelect: (item: ?Object | Array<Object>) => any,
  onCancel: () => any,
  getTitle: (item: Object) => string,
  getValue?: (item: Object) => string,
  selectedItems: Array<Object>,
  title: string,
  multi: boolean,
  emptyValue: ?string,
  height: number,
  style: any
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
    const selectedItems = this.props.selectedItems ? this.props.selectedItems : [];
    this.setState({selectedItems});
    this._loadItems(this.state.query);
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
        {this.state.selectedItems.length === 0 && <View style={styles.selectedMark}></View>}

        <Text style={[styles.itemTitle, {marginLeft: 0}]}>{this.props.emptyValue}</Text>
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

    if (this._isSelected(item)) {
      this.setState({selectedItems: this.state.selectedItems.filter(it => it.id !== item.id)});
    } else {
      this.setState({selectedItems: this.state.selectedItems.concat(item)});
    }
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
        {item.avatarUrl && <Image style={styles.itemIcon} source={{uri: item.avatarUrl}}/>}

        {this._isSelected(item) && <View style={styles.selectedMark}></View>}

        {this._renderTitle(item)}
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={{height: this.props.height}}>
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={this.props.onCancel.bind(this)}
          rightButton={this.props.multi ? <Text>Apply</Text> : null}
          onRightButtonClick={this._onSave.bind(this)}>
          <Text style={styles.headerText}>{this.props.title}</Text>
        </Header>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Search item"
            keyboardAppearance="dark"
            placeholderTextColor={COLOR_PLACEHOLDER}
            returnKeyType="search"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            onSubmitEditing={(e) => this._onSearch(this.state.query)}
            value={this.state.query}
            onChangeText={(text) => {
              this.setState({query: text});
              this._onSearch(text);
            }}
            style={styles.searchInput}/>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag">
          {this._renderEmptyValueItem()}
          {this.state.filteredItems.map(item => this._renderRow(item))}

          {!this.state.loaded && <View style={styles.row}>
            <ActivityIndicator/>
            <Text style={styles.loadingMessage}>Loading values...</Text>
          </View>}
        </ScrollView>
        </View>
      </View>
    );
  }
}
