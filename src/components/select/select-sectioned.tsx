import * as React from 'react';
import {SectionList, SectionListData, Text, View} from 'react-native';

import Animated, {FadeIn} from 'react-native-reanimated';
import debounce from 'lodash.debounce';

import Select, {ISelectProps, ISelectState, IItem} from './select';

import styles from './select.styles';


interface ListSection {
  title: string;
}

export type SLItem = SectionListData<IItem, ListSection>;

export type ISectionedState = Omit<ISelectState, 'filteredItems' | 'items' | 'selectedItems'> & {
  filteredItems: SLItem[];
  items: SLItem[];
  selectedItems: SLItem[];
}

export interface ISectionedProps extends Omit<ISelectProps, 'dataSource'> {
  dataSource: (query: string) => Promise<SLItem[]>;
}


class SelectSectioned<P extends ISectionedProps, S extends ISectionedState> extends Select<P, S> {

  constructor(props: P) {
    super(props);
    // @ts-ignore
    this.state = {
      filteredItems: [],
      items: [],
      loaded: false,
      query: '',
      selectedItems: props.selectedItems || [],
    };
  }

  renderSectionHeader = ({section}: { section: SLItem }): React.ReactNode => {
    return section.title ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    ) : null;
  };

  removeDuplicateItems(source: SLItem[], duplicates: IItem[]): SLItem[] {
    const selectedMap: Record<string, string> = duplicates.reduce(
      (akk: Record<string, string>, it: IItem) => (
        {...akk, [it.id]: it.id}),
      {}
    );
    return source?.reduce(
      (akk: SLItem[], it: SLItem) => [
        ...akk,
        {
          ...it,
          data: it.data.filter((it: IItem) => !(it.id in selectedMap)),
        },
      ],
        [] as SLItem[]
    ).filter(
      (it: SLItem) => it.data.length > 0
    );
  }

  getFilteredItems(items: SLItem[], selected?: IItem[]) {
    const {selectedItems} = this.state;
    return [
      {title: '', data: selected || selectedItems},
    ...this.removeDuplicateItems(items, selected || selectedItems),
    ];
  }

  _onSearch = async (query: string = '') => {
    let filteredItems: SLItem[];
    let items: SLItem[] = this.state.items;
    this.setState({loaded: false});

    if (this.props.cacheResults && items.length > 0) {
      const doFilter = (data: SLItem[]): SLItem[] => (data || []).filter(
        (it: SLItem) => this.filterItemByLabel(it, query)
      );
      filteredItems = this.getFilteredItems(items).reduce((akk: SLItem[], it: IItem) => {
        const data: IItem[] = doFilter(it.data);
        if (data.length > 0) {
          akk.push({
            title: it.title,
            data,
          });
        }
        return akk;
      }, []);

    } else {
      items = await this.props.dataSource(query);
      filteredItems = this.getFilteredItems(items);
    }

    this.setState({
      filteredItems,
      items,
      loaded: true,
    });
  };

  _onSearchDebounced = debounce(this._onSearch, 300);

  onChangeText = (text: string) => {
    this.setState({query: text});
    this._onSearchDebounced(text);
  };

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
          sections={this.state.filteredItems}
          keyExtractor={this.getItemKey}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          ListEmptyComponent={null}
          ListHeaderComponent={header()}
          ItemSeparatorComponent={Select.renderSeparator}
          getItemLayout={Select.getItemLayout}
        />
      </Animated.View>
    );
  }
}


export default SelectSectioned;
