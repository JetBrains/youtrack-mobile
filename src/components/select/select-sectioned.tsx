import * as React from 'react';
import {SectionList, SectionListData, Text, View} from 'react-native';

import Animated, {FadeIn} from 'react-native-reanimated';
import debounce from 'lodash.debounce';

import Select, {SelectModal, ISelectProps, ISelectState, IItem} from './select';

import styles from './select.styles';


interface ListSection {
  title: string;
}

export type SLItem = SectionListData<IItem, ListSection>;

type State = Omit<ISelectState, 'filteredItems' | 'items'> & {
  filteredItems: SLItem[];
  items: SLItem[];
}

interface Props extends Omit<ISelectProps, 'dataSource'> {
  dataSource: (query: string) => Promise<SLItem[]>;
}


export class SelectSectionedModal extends SelectModal {
  constructor(props: ISelectProps) {
    super(props);
  }
}

class SelectSectioned extends Select<Props, State> {

  constructor(props: Props) {
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

  setFilteredItems(selected?: IItem[]) {
    const {items, selectedItems} = this.state;
    this.setState({
      filteredItems: [
        {title: '', data: selected || selectedItems},
        ...this.removeDuplicateItems(items, selected || selectedItems),
      ],
    });
  }

  _onSearch = async (query: string = '') => {
    this.setState({loaded: false});
    const items: SLItem[] = await this.props.dataSource(query);
    this.setState({
      items,
      loaded: true,
    });
    this.setFilteredItems();
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
    this.setFilteredItems(selectedItems);
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
          accessible={true}
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
