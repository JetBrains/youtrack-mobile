import * as React from 'react';
import {ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View} from 'react-native';

import debounce from 'lodash.debounce';

import ColorField, {NO_COLOR_CODING_ID} from 'components/color-field/color-field';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import SelectItem from './select__item';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconCheck, IconClose} from 'components/icon/icon';

import styles, {SELECT_ITEM_HEIGHT, SELECT_ITEM_SEPARATOR_HEIGHT} from './select.styles';

import type {ColorCoding} from 'components/color-field/color-field';
import type {ViewProps} from 'react-native';

export interface IItem {
  [key: string]: any;
}

interface TitleRenderer<T> {
  (item: T): React.ReactNode;
}

export interface ISelectProps<T extends IItem> {
  dataSource: (query: string) => Promise<T[]>;
  onSelect: (item: any | any[]) => any;
  onChangeSelection?: (selectedItems: T[], current: T) => void;
  onCancel?: () => void;
  getTitle?: (item: T) => string;
  header?: () => any;
  titleRenderer?: TitleRenderer<T>;
  getValue?: (item: T) => string;
  selectedItems: T[];
  placeholder?: string;
  multi?: boolean;
  autoFocus?: boolean;
  emptyValue?: string | null;
  style?: any;
  noFilter?: boolean;
  getWrapperComponent?: () => React.ElementType;
  getWrapperProps?: () => Partial<ViewProps> | ViewProps | null;
  isSelectionDisabled?: (selected: any[], current: any) => boolean;
  filterItems?: (items: T[]) => T[];
  closeIcon?: React.ElementType;
}

export interface ISelectState<T> {
  query: string;
  items: T[] | null;
  filteredItems: T[];
  selectedItems: T[];
  loaded: boolean;
}


export class Select<T extends ISelectProps<T>, S extends ISelectState<T>> extends React.PureComponent<T, S> {
  static defaultProps = {
    autoFocus: false,
    noFilter: false,
    getTitle: (item: IItem) => getEntityPresentation(item),
    header: () => null,
  };

  static getItemLayout<P>(items: ArrayLike<P> | null | undefined, index: number): {
    index: number;
    length: number;
    offset: number;
  } {
    const height = SELECT_ITEM_HEIGHT;
    const offset = (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index;
    return {
      length: height,
      offset: offset,
      index,
    };
  }

  static renderSeparator() {
    return <View style={styles.rowSeparator}/>;
  }

  constructor(props: T) {
    super(props);
    this.state = {
      query: '',
      items: null,
      filteredItems: [] as T[],
      selectedItems: props.selectedItems || ([] as T[]),
      loaded: false,
    } as S;
  }

  getSortedItems = (items: T[] = []): T[] => {
    const selectedItemsKey: string[] = this.state.selectedItems.map((it: T) => this.getItemKey(it));
    const nonSelected = items.reduce((data: T[], item: T) => {
      data.push(...(selectedItemsKey.includes(this.getItemKey(item)) ? [] : [item]));
      return data;
    }, []);
    return [...this.state.selectedItems, ...nonSelected];
  };

  componentDidMount() {
    this.onSearch(this.state.query);
  }

  componentDidUpdate(prevProps: ISelectProps<T>) {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.setState({
        loaded: false,
        filteredItems: [],
        items: null,
        selectedItems: this.props.selectedItems != null ? this.props.selectedItems : [],
      });

      this.onSearch(this.state.query);
    }
  }

  async doLoadItems(query: string = ''): Promise<T[]> {
    this.setState({loaded: false});
    const items = await this.props.dataSource(query);
    this.setState({loaded: true, items});
    return items;
  }

  renderEmptyValueItem() {
    const {emptyValue} = this.props;

    if (!emptyValue) {
      return null;
    }

    return (
      <View key={emptyValue}>
        <TouchableOpacity style={styles.row} onPress={this.onClearValue}>
          <Text style={styles.itemTitle}>{emptyValue}</Text>

          {this.state.selectedItems.length === 0 && (
            <IconCheck color={styles.link.color}/>
          )}
        </TouchableOpacity>
        {Select.renderSeparator()}
      </View>
    );
  }

  filterItemByLabel(item: T, query: string): boolean {
    const label: string = this.props?.getValue?.(item) || this.props?.getTitle?.(item) || '';
    return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  }

  getFilteredItems(items: T[] = [], query: string = ''): T[] {
    if (this.props.filterItems) {
      return this.props.filterItems(items);
    }
    return items.filter(it => this.filterItemByLabel(it, query));
  }

  async onSearch(query: string) {
    await this.doLoadItems(query);
    const filteredItems: T[] = this.getFilteredItems(this.state.items || [], query);
    this.setState({
      filteredItems: this.getSortedItems(filteredItems),
    });
  }

  _onSearch = debounce(this.onSearch, 300);

  _renderTitle<P extends T & {color?: ColorCoding}>(item: P) {
    const label = <Text style={styles.itemTitle}>{this?.props?.getTitle?.(item)}</Text>;

    if ('color' in item && item?.color?.id !== NO_COLOR_CODING_ID) {
      return (
        <View style={styles.colorFieldItemWrapper}>
          <ColorField text={this?.props?.getTitle?.(item)} color={item.color} style={styles.colorField} />
          {label}
        </View>
      );
    }

    return label;
  }

  _isSelected(item: T) {
    return this.state.selectedItems.some(
      selectedItem => 'id' in item && 'id' in selectedItem && item.id === selectedItem.id
    );
  }

  onSelect(item: T | T[] | null) {
    return this.props.onSelect(item);
  }

  _onTouchItem(item: T): T[] {
    const selectionDisabled = this.props?.isSelectionDisabled?.(this.state.selectedItems, item) || false;
    if (selectionDisabled) {
      return this.state.selectedItems;
    }
    if (!this.props.multi) {
      this.onSelect(item);
      return [item];
    }
    const selectedItems = this._isSelected(item)
      ? this.state.selectedItems.filter(it => 'id' in it && 'id' in item && it.id !== item.id)
      : this.state.selectedItems.concat(item);

    this.setState({selectedItems});
    this.props?.onChangeSelection?.(selectedItems, item);
    return selectedItems;
  }

  onClearValue = () => {
    return this.onSelect(this.props.multi ? [] : null);
  };

  _onSave() {
    return this.onSelect(this.state.selectedItems);
  }

  getItemLayout(items: T[] | null, index: number): {
    index: number;
    length: number;
    offset: number;
  } {
    return {
      length: SELECT_ITEM_HEIGHT,
      offset: (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index,
      index,
    };
  }

  renderItem = ({item}: {item: T}) => {
    return (
      <SelectItem
        item={item}
        isSelected={this._isSelected(item)}
        onPress={() => this._onTouchItem(item)}
        titleRenderer={() => (this.props.titleRenderer ? this.props.titleRenderer(item) : this._renderTitle(item))}
      />
    );
  };

  getItemKey = <
    P extends T & {
      id?: string;
      ringId?: string;
      name?: string;
      key?: string;
    }
  >(
    item: P
  ): string => item.id || item.ringId || item.name || item.key || '';

  renderListHeader() {
    return this.renderEmptyValueItem();
  }

  renderItems() {
    return (
      <FlatList
        contentContainerStyle={styles.container}
        testID="test:id/selectList"
        accessibilityLabel="selectList"
        accessible={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={this.renderListHeader()}
        scrollEventThrottle={50}
        data={this.state.filteredItems}
        keyExtractor={this.getItemKey}
        renderItem={this.renderItem}
        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
        extraData={this.state.selectedItems}
        ListFooterComponent={() => {
          return (
            <View style={styles.footer}>
              {!this.state.loaded && (
                <>
                  <ActivityIndicator color={styles.link.color}/>
                  <Text style={styles.loadingMessage}>{i18n('Loading values…')}</Text>
                </>
              )}
              {this.state.loaded && this.state?.items?.length === 0 && (
                <Text style={styles.loadingMessage}>{i18n('No items')}</Text>
              )}
            </View>
          );
        }}
      />
    );
  }

  getWrapperComponent(): React.ElementType {
    return this.props.getWrapperComponent
      ? this.props.getWrapperComponent()
      : ModalView;
  }

  getWrapperProps(defaultWrapperProps: {visible: boolean; animationType: string}) {
    return this.props.getWrapperProps ? this.props.getWrapperProps() : defaultWrapperProps;
  }

  onCancel = () => {
    this?.props?.onCancel?.();
  };

  renderHeader() {
    return this.props.header ? (
      <View testID="test:id/selectHeader" style={styles.note}>{this.props.header()}</View>
    ) : null;
  }

  onChangeText = (text: string) => {
    this.setState({query: text});
    this._onSearch(text);
  };

  renderContent = () => {
    const {
      multi,
      autoFocus,
      style,
      placeholder = i18n('Filter items'),
      noFilter,
    } = this.props;
    const WrapperComponent = this.getWrapperComponent();
    const wrapperProps = this.getWrapperProps({
      visible: true,
      animationType: 'slide',
    });
    const Icon = this.props.closeIcon || IconClose;
    return (
      <WrapperComponent
        testID="test:id/select"
        {...wrapperProps}
        style={[styles.select, style]}
      >
        {this.renderHeader()}
        {!noFilter && (
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              testID="test:id/selectBackButton"
              accessibilityLabel="selectBackButton"
              accessible={true}
              onPress={this.onCancel}
            >
              <Icon
                size={23}
                style={styles.cancelButton}
                color={styles.cancelButton.color}
              />
            </TouchableOpacity>

            <TextInput
              placeholder={placeholder}
              autoFocus={autoFocus}
              testID="test:id/selectInput"
              accessibilityLabel="selectInput"
              accessible={true}
              placeholderTextColor={styles.placeholder.color}
              returnKeyType={multi ? 'done' : 'search'}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              onSubmitEditing={async () => (multi ? this._onSave() : await this.onSearch(this.state.query))}
              value={this.state.query}
              onChangeText={this.onChangeText}
              autoCapitalize="none"
              style={styles.searchInput}
            />

            {multi && (
              <TouchableOpacity
                testID="test:id/applyButton"
                accessibilityLabel="applyButton"
                accessible={true}
                style={styles.applyButton}
                onPress={() => this._onSave()}
              >
                <IconCheck color={styles.link.color}/>
              </TouchableOpacity>
            )}
          </View>
        )}

        {this.renderItems()}
      </WrapperComponent>
    );
  };

  render() {
    return this.renderContent();
  }
}


export class SelectModal<T extends ISelectProps<T>, S extends ISelectState<T> & {visible: boolean}> extends Select<T, S> {
  constructor(props: T) {
    super(props);
    this.state = {...this.state, visible: true};
  }

  onHide = () => {
    this.setState({
      visible: false,
    });
  };
  onCancel = () => {
    this?.props?.onCancel?.();
    this.onHide();
  };
  onSelect = (item: T) => {
    this.props.onSelect(item);
    this.onHide();
  };
  getWrapperProps = (): Partial<ViewProps> | null => {
    return null;
  };
  getWrapperComponent = () => {
    return View;
  };
  render = () => {
    const {visible} = this.state;
    return (
      <ModalPortal
        testID="test:id/selectModalContainer"
        style={styles.modalPortalSelectContent}
        onHide={this.onCancel}
      >
        {visible && this.renderContent()}
      </ModalPortal>
    );
  };
}

export default Select;
