import * as React from 'react';
import {ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import debounce from 'lodash.debounce';

import ColorField from 'components/color-field/color-field';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import SelectItem from './select__item';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconCheck, IconClose} from 'components/icon/icon';

import styles, {SELECT_ITEM_HEIGHT, SELECT_ITEM_SEPARATOR_HEIGHT} from './select.styles';


export type IItem = {
  [key: string]: any;
};

interface TitleRenderer<T> {
  (item: T): React.ReactNode;
}

export interface ISelectProps {
  dataSource: (query: string) => Promise<IItem[]>;
  onSelect: (item: any) => any;
  onChangeSelection: (selectedItems: IItem[], current: IItem) => any;
  onCancel: () => any;
  getTitle: (item: IItem) => string;
  header?: () => any;
  titleRenderer?: TitleRenderer<any>;
  getValue?: (item: IItem) => string;
  selectedItems: IItem[];
  placeholder?: string;
  multi?: boolean;
  autoFocus?: boolean;
  emptyValue?: string | null | undefined;
  style?: any;
  noFilter?: boolean;
  getWrapperComponent?: () => any;
  getWrapperProps?: () => any;
}

export interface ISelectState {
  query: string;
  items: IItem[] | null;
  filteredItems: IItem[];
  selectedItems: IItem[];
  loaded: boolean;
}


export class Select<P extends ISelectProps, S extends ISelectState> extends React.PureComponent<P, S> {
  static defaultProps: {
    autoFocus: boolean;
    getTitle: (item: any) => any;
    header: () => null;
    noFilter: boolean;
    onChangeSelection: (items: any[]) => null;
  } = {
    autoFocus: false,
    onChangeSelection: () => null,
    noFilter: false,
    getTitle: (item: IItem) => getEntityPresentation(item),
    header: () => null,
  };

  static getItemLayout(
    items: IItem[] | null | undefined,
    index: number,
  ): {
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

  static renderSeparator(): React.ReactNode {
    return <View style={styles.rowSeparator}/>;
  }

  constructor(props: P) {
    super(props);
    this.state = {
      query: '',
      items: null,
      filteredItems: [] as IItem[],
      selectedItems: props.selectedItems || ([] as IItem[]),
      loaded: false,
    } as S;
  }

  getSortedItems = (items: IItem[] = []): IItem[] => {
    const selectedItemsKey: string[] = this.state.selectedItems.map(
      (it: IItem) => this.getItemKey(it),
    );
    const nonSelected: IItem[] = items.reduce(
      (data: IItem[], item: IItem) => [
        ...data,
        ...(selectedItemsKey.includes(this.getItemKey(item)) ? [] : [item]),
      ],
      [] as IItem[]
    );
    return [...this.state.selectedItems, ...nonSelected];
  };

  componentDidMount() {
    this.onSearch(this.state.query);
  }

  componentDidUpdate(prevProps: ISelectProps) {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.setState({
        loaded: false,
        filteredItems: [],
        items: null,
        selectedItems: this.props.selectedItems || [],
      });

      this.onSearch(this.state.query);
    }
  }

  async doLoadItems(query: string = ''): Promise<IItem[]> {
    this.setState({loaded: false});
    const items: IItem[] = await this.props.dataSource(query);
    this.setState({loaded: true, items});
    return items;
  }

  renderEmptyValueItem(): React.ReactElement | null {
    const {emptyValue} = this.props;

    if (!emptyValue) {
      return null;
    }

    return (
      <View key={emptyValue}>
        <TouchableOpacity style={styles.row} onPress={this.onClearValue}>
          <Text style={styles.itemTitle}>{emptyValue}</Text>

          {this.state.selectedItems.length === 0 && (
            <IconCheck size={20} color={styles.link.color}/>
          )}
        </TouchableOpacity>
        {Select.renderSeparator()}
      </View>
    );
  }

  filterItemByLabel(item: any, query: string): boolean {
    const {getValue, getTitle} = this.props;
    const label: string = (getValue && getValue(item)) || getTitle(item) || '';
    return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  }

  getFilteredItems(items: IItem[] = [], query: string = ''): IItem[] {
    return items.filter((it: IItem) => this.filterItemByLabel(it, query));
  }

  async onSearch(query: string) {
    await this.doLoadItems(query);
    const filteredItems: IItem[] = this.getFilteredItems(this.state.items || [], query);
    this.setState({
      filteredItems: this.getSortedItems(filteredItems),
    });
  }

  _onSearch = debounce(this.onSearch, 300);

  _renderTitle(item: IItem): React.ReactNode {
    const label: React.ReactElement<React.ComponentProps<any>, any> = (
      <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>
    );

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

  _isSelected(item: IItem) {
    return this.state.selectedItems.some(
      selectedItem => item.id === selectedItem.id,
    );
  }

  onSelect(item: any): any {
    return this.props.onSelect(item);
  }

  _onTouchItem(item: IItem): IItem[] {
    if (!this.props.multi) {
      this.onSelect(item);
      return [item];
    }
    let selectedItems = this._isSelected(item)
      ? this.state.selectedItems.filter(it => it.id !== item.id)
      : this.state.selectedItems.concat(item);

    if (item.toggleItem) {
      selectedItems = selectedItems.filter((it: IItem) => {
        return it.toggleItem ? it.id === item.id : it;
      });
    }

    this.setState({selectedItems});
    this.props.onChangeSelection(selectedItems, item);
    return selectedItems;
  }

  onClearValue: () => any = () => {
    return this.onSelect(this.props.multi ? [] : null);
  };

  _onSave() {
    return this.onSelect(this.state.selectedItems);
  }

  getItemLayout(
    items: IItem[] | null | undefined,
    index: number,
  ): {
    index: number;
    length: any;
    offset: number;
  } {
    return {
      length: SELECT_ITEM_HEIGHT,
      offset: (SELECT_ITEM_HEIGHT + SELECT_ITEM_SEPARATOR_HEIGHT) * index,
      index,
    };
  }

  renderItem = ({item}: IItem): React.ReactNode => {
    return (
      <SelectItem
        item={item}
        isSelected={this.state.selectedItems.some(
          selectedItem => item.id === selectedItem.id,
        )}
        onPress={() => this._onTouchItem(item)}
        titleRenderer={() =>
          this.props.titleRenderer
            ? this.props.titleRenderer(item)
            : this._renderTitle(item)
        }
      />
    );
  };

  getItemKey = (item: IItem): string => item.key || item.ringId || item.id;

  renderItems() {
    return (
      // @ts-ignore
      <FlatList
        testID="test:id/selectList"
        accessibilityLabel="selectList"
        accessible={false}
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

  getWrapperComponent(): any {
    return this.props.getWrapperComponent
      ? this.props.getWrapperComponent()
      : ModalView;
  }

  getWrapperProps(defaultWrapperProps: { visible: boolean; animationType: string; }): IItem | null {
    return this.props.getWrapperProps
      ? this.props.getWrapperProps()
      : defaultWrapperProps;
  }

  onCancel: () => void = (): void => {
    this.props.onCancel();
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

  renderContent = (): React.ReactNode => {
    const {
      multi,
      autoFocus,
      style,
      placeholder = i18n('Filter items'),
      noFilter,
    } = this.props;
    const WrapperComponent: any = this.getWrapperComponent();
    const wrapperProps: IItem | null = this.getWrapperProps({
      visible: true,
      animationType: 'slide',
    });
    return (
      <WrapperComponent
        testID="test:id/select"
        {...wrapperProps}
        style={style}
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
              <IconClose
                size={21}
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
              onSubmitEditing={async () => multi ? this._onSave() : await this.onSearch(this.state.query)}
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
                <IconCheck size={20} color={styles.link.color}/>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!this.state.loaded && (
          <View style={[styles.row, styles.loadingRow]}>
            <ActivityIndicator color={styles.link.color}/>
            <Text style={styles.loadingMessage}>{i18n('Loading values…')}</Text>
          </View>
        )}
        {this.state.loaded && this.state?.items?.length === 0 && (
          <View style={[styles.row, styles.loadingRow]}>
            <Text style={styles.loadingMessage}>{i18n('No items')}</Text>
          </View>
        )}

        {this.renderItems()}
      </WrapperComponent>
    );
  };

  render(): React.ReactNode {
    return this.renderContent();
  }
}


export class SelectModal extends Select<ISelectProps, ISelectState & { visible: boolean; }> {
  constructor(props: ISelectProps) {
    super(props);
    this.state = {...this.state, visible: true};
  }

  onHide: () => void = (): void => {
    this.setState({
      visible: false,
    });
  };
  onCancel: () => void = (): void => {
    this.props.onCancel();
    this.onHide();
  };
  onSelect: (items: any) => void = (item: any): void => {
    this.props.onSelect(item);
    this.onHide();
  };
  getWrapperProps = (): IItem | null => {
    return null;
  };
  getWrapperComponent: () => any = (): any => {
    return View;
  };
  render: () => React.ReactNode = (): React.ReactNode => {
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
