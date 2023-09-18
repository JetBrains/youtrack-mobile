import * as React from 'react';
import {SectionList, Text, View} from 'react-native';

import Animated, {FadeIn} from 'react-native-reanimated';

import ModalPortal from 'components/modal-view/modal-portal';
import Select, {ISelectProps, ISelectState, IItem} from './select';

import styles from './select.styles';
import {SectionListData} from 'react-native/Libraries/Lists/SectionList';


export interface SLItem {
  [key: string]: any;
}

interface Section extends SectionListData<SLItem, SLItem>{
  title: string;
  data: SLItem[];
}

export type ISectionedState = Omit<ISelectState, 'filteredItems' | 'items' | 'selectedItems'> & {
  filteredItems: Section[];
  items: SLItem[];
  selectedItems: SLItem[];
}

export interface ISectionedProps extends Omit<ISelectProps, 'dataSource'> {
  dataSource: (query: string) => Promise<SLItem[]>;
}


export default class SelectSectioned<P extends ISectionedProps, S extends ISectionedState> extends Select<P, S> {

  constructor(props: P) {
    super(props);
    // @ts-ignore
    this.state = {
      filteredItems: [],
      items: [],
      loaded: false,
      query: '',
      selectedItems: props.selectedItems || [],
      visible: true,
    };
  }

  renderSectionHeader = ({section}: { section: SLItem }): React.ReactNode => {
    return section.title ? (
      <View style={[styles.sectionHeader, !section.title.trim() && styles.sectionHeaderEmpty]}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ) : null;
  };

  removeDuplicateItems(source: SLItem[], duplicates: IItem[]): Section[] {
    const selectedMap: Record<string, string> = duplicates.reduce(
      (akk: Record<string, string>, it: IItem) => (
        {...akk, [it.id]: it.id}),
      {}
    );
    return source?.reduce(
      (akk, it) => [
        ...akk,
        {
          ...it,
          data: it.data.filter((it: IItem) => !(it.id in selectedMap)),
        },
      ],
        []
    ).filter((it: SLItem) => it.data.length > 0);
  }

  getFilteredItems(items: SLItem[], selected?: SLItem[]): Section[] {
    const {selectedItems} = this.state;
    let _selectedItems: SLItem[] = selected || selectedItems;

    if (_selectedItems?.length) {
      const itemsMap: Record<string, SLItem> = items.reduce((akk, it: SLItem) => {
        return {
          ...akk,
          ...it.data.reduce((a,i) => ({...a, [i.id]: i}), {}),
        };
      }, {});

      _selectedItems = _selectedItems.reduce((akk: SLItem[], it: SLItem) => {
        return [...akk, itemsMap[it.id] ? {...it, ...itemsMap[it.id]} : it];
      }, []);
    }
    return [
      {title: '', data: _selectedItems},
    ...this.removeDuplicateItems(items, _selectedItems),
    ];
  }

  async onSearch(query: string) {
    const filterByLabel = (data: SLItem[]): SLItem[] => (data || []).filter(
      (it: SLItem) => this.filterItemByLabel(it, query)
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

  _onTouchItem(item: IItem) {
    const selectedItems: IItem[] = super._onTouchItem(item);
    this.setState({
      filteredItems: this.getFilteredItems(this.state.items, selectedItems),
    });
    return selectedItems;
  }

  renderItems() {
    const {header = () => null} = this.props;
    return (
      <Animated.View
        layout={FadeIn.duration(500)}
      >
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
      </Animated.View>
    );
  }
}


export type ISelectionedStateModal = ISectionedState & { visible: boolean };

export class SelectSectionedModal<P extends ISectionedProps, S extends ISelectionedStateModal> extends SelectSectioned<P, S> {
  constructor(props: P) {
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
