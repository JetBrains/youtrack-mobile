import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

// @ts-ignore
import DraggableFlatList from 'react-native-draggable-dynamic-flatlist';
import {View as AnimatedView} from 'react-native-animatable';

import Header from 'components/header/header';
import Select from 'components/select/select';
import {EllipsisVertical, IconAdd, IconCheck, IconClose} from 'components/icon/icon';
import {i18n} from 'components/i18n/i18n';

import styles from './issues.styles';


const IssuesFiltersSettingList = ({
  filters,
  onApply,
  onBack,
  onAdd,
}: {
  filters: string[],
  onApply: (filters: string[]) => void;
  onBack: () => void;
  onAdd: () => void;
}) => {
  const [sorted, setSorted] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (filters) {
      setSorted(filters);
    }
  }, [filters]);

  const renderItem = ({
    item,
    move,
    isActive,
  }: {
    item: string;
    move: () => any;
    isActive: boolean;
  }): React.JSX.Element => {
    return (
      <AnimatedView
        animation="fadeIn"
        duration={500}
        useNativeDriver
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.sortByListItem,
            isActive ? styles.sortByListItemActive : null,
          ]}
          disabled={isActive}
          onLongPress={move}
        >
          <View style={styles.rowLine}>
            <EllipsisVertical size={22} color={styles.sortIcon.color} />
            <Text style={styles.sortByListItemText}>
              {item}
            </Text>
          </View>
          <View style={styles.rowLine}>
            <TouchableOpacity
              style={styles.sortIconButton}
              onPress={() => setSorted(
                sorted.filter((it: string) => it !== item)
              )}
            >
              <IconClose size={20} color={styles.sortIcon.color} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </AnimatedView>
    );
  };

  return (
    <View style={styles.listContainer}>
      <Header
        showShadow={true}
        leftButton={
          <IconClose
            size={21}
            color={styles.link.color}
            style={styles.sortIconBack}
          />
        }
        onBack={onBack}
        rightButton={
          <IconCheck
            size={20}
            color={styles.link.color}
            style={styles.sortByListAddIcon}
          />
        }
        onRightButtonClick={() => {
          onApply(sorted);
          onBack();
        }}
        extraButton={
          <TouchableOpacity
            style={styles.sortIconButton}
            onPress={onAdd}
          >
            <IconAdd
              size={21}
              style={styles.sortByListAddIcon}
              color={styles.link.color}
            />
          </TouchableOpacity>
        }
      >
        <Text style={styles.headerTitle}>{i18n('Filter Settings')}</Text>
      </Header>

      <DraggableFlatList
        containerStyle={styles.sortByList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={50}
        data={sorted}
        onMoveEnd={({data}: { data: string[] }) => {
          setSorted(data);
        }}
        scrollPercent={5}
        keyExtractor={(it: string) => it}
        renderItem={renderItem}
        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
      />
    </View>
  );
};


export default React.memo(IssuesFiltersSettingList);

