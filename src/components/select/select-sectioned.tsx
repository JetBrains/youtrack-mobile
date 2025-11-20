import * as React from 'react';
import {SectionList, Text, View} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import Select, {ISelectProps, ISelectState, IItem} from './select';

import styles from './select.styles';

import {SectionListData} from 'react-native/Libraries/Lists/SectionList';

function toSelectProps<T extends IItem>(props: ISectionedProps<T>): ISelectProps<T> {
  return props as unknown as ISelectProps<T>;
}

interface Section<T extends IItem> extends SectionListData<T, {title: string}> {
  title: string;
  data: T[];
}

export type ISectionedState<T extends IItem> = Omit<ISelectState<T>, 'filteredItems' | 'items'> & {
  filteredItems: Section<T>[];
  items: Section<T>[];
};

export interface ISectionedProps<T extends IItem> extends Omit<ISelectProps<T>, 'dataSource'> {
  dataSource: (query: string) => Promise<Section<T>[]>;
}

export default class SelectSectioned<
  T extends IItem = IItem,
  S extends ISectionedState<T> = ISectionedState<T>,
> extends Select<T, S & ISelectState<T>> {
  private readonly _props: ISectionedProps<T>;

  constructor(props: ISectionedProps<T>) {
    super(toSelectProps(props));
    this._props = props;
    this.state = {
      filteredItems: [],
      items: [],
      loaded: false,
      query: '',
      selectedItems: props.selectedItems || [],
    } as unknown as S & ISelectState<T>;
  }

  renderSectionHeader = ({section}: {section: Section<T>}) => {
    return section.title ? (
      <View style={[styles.sectionHeader, !section.title.trim() && styles.sectionHeaderEmpty]}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ) : null;
  };

  removeDuplicateItems(source: Section<T>[], duplicates: T[]): Section<T>[] {
    const selectedMap: Record<string, string> = duplicates.reduce(
      (akk: Record<string, string>, it: T) => ({...akk, [it.id]: it.id}),
      {},
    );
    return source
      ?.reduce((akk: Section<T>[], it: Section<T>) => {
        akk.push({
          ...it,
          data: it.data.filter((i: T) => !(i.id in selectedMap)),
        });
        return akk;
      }, [])
      .filter((it: Section<T>) => it.data.length > 0);
  }

  // @ts-expect-error - Override with incompatible return type (Section<T>[] vs T[]) due to sectioned data structure
  override getFilteredItems(items: Section<T>[] = [], query?: string): Section<T>[] {
    const {selectedItems} = this.state;
    let _selectedItems: T[] = selectedItems;

    if (_selectedItems?.length) {
      const itemsMap: Record<string, T> = items.reduce((akk: Record<string, T>, it: Section<T>) => {
        if (it?.data) {
          akk = {
            ...akk,
            ...it.data.reduce((a: Record<string, T>, i: T) => ({...a, [i.id]: i}), {}),
          };
        }
        return akk;
      }, {});

      _selectedItems = _selectedItems.reduce((akk: T[], it: T) => {
        return [...akk, itemsMap[it.id] ? {...it, ...itemsMap[it.id]} : it];
      }, []);
    }
    return [{title: '', data: _selectedItems}, ...this.removeDuplicateItems(items, _selectedItems)];
  }

  // @ts-expect-error - Override with incompatible return type (Section<T>[] vs T[]) due to sectioned data structure
  override async doLoadItems(query: string = ''): Promise<Section<T>[]> {
    this.setState({loaded: false});
    const items: Section<T>[] = await this._props.dataSource(query);
    this.setState({loaded: true, items} as unknown as Pick<S & ISelectState<T>, 'loaded' | 'items'>);
    return items;
  }

  async onSearch(query: string) {
    const filterByLabel = (data: T[]): T[] => (data || []).filter((it: T) => this.filterItemByLabel(it, query));
    const doSearch = (items: Section<T>[]): Section<T>[] =>
      this.getFilteredItems(items).reduce((akk: Section<T>[], it: Section<T>) => {
        const data: T[] = filterByLabel(it.data);
        if (data.length > 0) {
          akk.push({
            title: it.title,
            data,
          });
        }
        return akk;
      }, []);

    const items = await this.doLoadItems(query);
    this.setState({filteredItems: doSearch(items)} as unknown as Pick<S & ISelectState<T>, 'filteredItems'>);
  }

  renderHeader() {
    return null;
  }

  _onTouchItem(item: T): T[] {
    const selectedItems: T[] = super._onTouchItem(item);
    this.setState({
      filteredItems: this.getFilteredItems(this.state.items),
    } as unknown as Pick<S & ISelectState<T>, 'filteredItems'>);
    return selectedItems;
  }

  renderItems() {
    const {header = () => null} = this.props;
    return (
      <SectionList
        contentContainerStyle={styles.list}
        testID="test:id/selectListSectioned"
        accessibilityLabel="selectListSectioned"
        accessible={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={10}
        sections={this.state.filteredItems as any}
        keyExtractor={this.getItemKey}
        renderItem={this.renderItem as any}
        renderSectionHeader={this.renderSectionHeader as any}
        ListEmptyComponent={null}
        ListHeaderComponent={header()}
        ItemSeparatorComponent={Select.renderSeparator as any}
        getItemLayout={Select.getItemLayout}
      />
    );
  }
}

export type ISelectionedStateModal<T extends IItem> = ISectionedState<T> & {visible: boolean};

export class SelectSectionedModal<
  T extends IItem = IItem,
  S extends ISelectionedStateModal<T> = ISelectionedStateModal<T>,
> extends SelectSectioned<T, S> {
  constructor(props: ISectionedProps<T>) {
    super(props);
    this.state = {...this.state, visible: true};
  }

  onHide = () => {
    this.setState({
      visible: false,
    });
  };
  onCancel = () => {
    this.props?.onCancel?.();
    this.onHide();
  };
  onSelect = (item: T | T[] | null) => {
    this.props.onSelect(item);
    this.onHide();
  };
  getWrapperProps = () => {
    return null;
  };
  getWrapperComponent = () => {
    return View;
  };
  render = () => {
    return (
      <ModalPortal testID="test:id/selectModalContainer" style={styles.modalPortalSelectContent} onHide={this.onCancel}>
        {this.state.visible && this.renderContent()}
      </ModalPortal>
    );
  };
}
