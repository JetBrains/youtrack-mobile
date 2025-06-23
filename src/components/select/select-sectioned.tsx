import * as React from 'react';
import {SectionList, Text, View} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import Select, {ISelectProps, ISelectState, IItem} from './select';

import styles from './select.styles';

import {SectionListData} from 'react-native/Libraries/Lists/SectionList';


interface Section extends SectionListData<IItem, IItem>{
  title: string;
  data: IItem[];
}

export type ISectionedState = Omit<ISelectState<IItem>, 'filteredItems' | 'items' | 'selectedItems'> & {
  filteredItems: Section[];
  items: IItem[];
  selectedItems: IItem[];
}

export interface ISectionedProps extends Omit<ISelectProps<IItem>, 'dataSource'> {
  dataSource: (query: string) => Promise<IItem[]>;
}


export default class SelectSectioned<S extends ISectionedState = ISectionedState> extends Select<IItem, S> {

  constructor(props: ISectionedProps) {
    super(props);
    this.state = {
      filteredItems: [],
      items: [],
      loaded: false,
      query: '',
      selectedItems: props.selectedItems || [],
      visible: true,
    };
  }

  renderSectionHeader = ({section}: { section: IItem }) => {
    return section.title ? (
      <View style={[styles.sectionHeader, !section.title.trim() && styles.sectionHeaderEmpty]}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ) : null;
  };

  removeDuplicateItems(source: IItem[], duplicates: IItem[]): Section[] {
    const selectedMap: Record<string, string> = duplicates.reduce(
      (akk: Record<string, string>, it: IItem) => (
        {...akk, [it.id]: it.id}),
      {}
    );
    return source
      ?.reduce((akk, it) => {
        akk.push({
          ...it,
          data: it.data.filter((i: IItem) => !(i.id in selectedMap)),
        });
        return akk;
      }, [])
      .filter((it: IItem) => it.data.length > 0);
  }

  getFilteredItems(items: IItem[], query?: string): Section[] {
    const {selectedItems} = this.state;
    let _selectedItems: IItem[] = selectedItems;

    if (_selectedItems?.length) {
      const itemsMap: Record<string, IItem> = items.reduce((akk, it: IItem) => {
        if (it?.data) {
          akk = {
            ...akk,
            ...it.data.reduce((a: Record<string, IItem>, i: IItem) => ({...a, [i.id]: i}), {}),
          };
        }
        return akk;
      }, {});

      _selectedItems = _selectedItems.reduce((akk: IItem[], it: IItem) => {
        return [...akk, itemsMap[it.id] ? {...it, ...itemsMap[it.id]} : it];
      }, []);
    }
    return [
      {title: '', data: _selectedItems},
    ...this.removeDuplicateItems(items, _selectedItems),
    ];
  }

  async onSearch(query: string) {
    const filterByLabel = (data: IItem[]): IItem[] => (data || []).filter(
      (it: IItem) => this.filterItemByLabel(it, query)
    );
    const doSearch = (): Section[] => (
      this.getFilteredItems(this.state.items).reduce((akk: Section[], it: IItem) => {
        const data: IItem[] = filterByLabel(it.data);
        if (data.length > 0) {
          akk.push({
            title: it.title,
            data,
          });
        }
        return akk;
      }, [])
    );

    await this.doLoadItems(query);
    this.setState({filteredItems: doSearch()});
  }

  renderHeader() {
    return null;
  }

  _onTouchItem(item: IItem): IItem[] {
    const selectedItems: IItem[] = super._onTouchItem(item);
    this.setState({
      filteredItems: this.getFilteredItems(this.state.items),
    });
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


export type ISelectionedStateModal = ISectionedState & { visible: boolean };

export class SelectSectionedModal<S extends ISelectionedStateModal = ISelectionedStateModal> extends SelectSectioned<S> {
  constructor(props: ISectionedProps) {
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
  onSelect = (item: IItem | IItem[] | null) => {
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
      <ModalPortal
        testID="test:id/selectModalContainer"
        style={styles.modalPortalSelectContent}
        onHide={this.onCancel}
      >
        {this.state.visible && this.renderContent()}
      </ModalPortal>
    );
  };
}
