import React, {useCallback, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import IssuesSortByList from './issues__sortby_list';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import {IconAngleRight} from 'components/icon/icon';
import {doAssist, getSortPropertyName} from './issues-helper';
import {i18n} from 'components/i18n/i18n';
import {isSplitView} from 'components/responsive/responsive-helper';
import styles from './issues.styles';

import type {Folder} from 'types/User';
import type {IssueFieldSortProperty, SearchSuggestions} from 'types/Sorting';

const MAX_NUMBER_SORTING_PROPERTIES: number = 4;


const IssuesSortByTitle = ({sortProperties, onPress}: {
  sortProperties: IssueFieldSortProperty[];
  onPress: () => void
}) => {

  const getUniqueSortProperties = (sProperties: IssueFieldSortProperty[]) => {
    const sortPropertiesIds: Record<string, IssueFieldSortProperty | boolean> = {};
    return sProperties.filter((it: IssueFieldSortProperty) =>
      sortPropertiesIds[it.id] ? false : (sortPropertiesIds[it.id] = true),
    );
  };

  const createSortButtonTitle = (sProperties: IssueFieldSortProperty[]): string => {
    const uniqueSortProperties = getUniqueSortProperties(sProperties);
    return uniqueSortProperties
      .slice(0, MAX_NUMBER_SORTING_PROPERTIES)
      .map((it: IssueFieldSortProperty) => getSortPropertyName(it))
      .join(', ');
  };

  return sortProperties?.length ? (
    <>
      <TouchableOpacity
        testID="test:id/issuesSortBy"
        accessibilityLabel="issuesSortBy"
        accessible={true}
        style={styles.settingsRow}
        onPress={onPress}
      >
        <Text
          numberOfLines={2}
          style={styles.settingsItemText}
        >
          {i18n('Sorted by')} {createSortButtonTitle(sortProperties)}
        </Text>
        <IconAngleRight
          size={19}
          color={styles.settingsItemIcon.color}
        />
      </TouchableOpacity>
    </>
  ) : null;
};


const IssuesSortBy = ({context, onApply, query, onOpen}: {
  context: Folder;
  onApply: (query: string) => void;
  query: string;
  onOpen: () => void;
}) => {
  const [selectedSortProperties, updateSelectedSortProperties] = useState<IssueFieldSortProperty[]>([]);
  const [modalChildren, updateModalChildren] = useState(null);

  const loadSortingProperties = useCallback(
    async (ctx: Folder, q: string) => {
      const searchSuggestions: SearchSuggestions = await doAssist({context: ctx, query: q});
      updateSelectedSortProperties(searchSuggestions.sortProperties);
    },
    [],
  );

  useEffect(() => {
    loadSortingProperties(context, query);
  }, [loadSortingProperties, context, query]);

  const renderIssuesSortByList = (): React.JSX.Element => {
    const issuesSortByListOnBack: () => void = () => {
      if (isSplitView()) {
        updateModalChildren(null);
      } else {
        Router.pop(true);
      }
    };

    return (
      <IssuesSortByList
        context={context}
        onApply={(
          sortProperties: IssueFieldSortProperty[],
          q: string,
        ) => {
          updateSelectedSortProperties(sortProperties);
          onApply(q);

          if (sortProperties.length === 0) {
            issuesSortByListOnBack();
          }
        }}
        onBack={issuesSortByListOnBack}
        query={query}
        selectedSortProperties={selectedSortProperties}
      />
    );
  };

  return selectedSortProperties?.length ? (
    <>
      <View
        testID="test:id/issuesSortBy"
        accessibilityLabel="issuesSortBy"

      >
        <IssuesSortByTitle
          sortProperties={selectedSortProperties}
          onPress={() => {
            if (isSplitView()) {
              updateModalChildren(renderIssuesSortByList());
            } else {
              onOpen();
              Router.PageModal({
                children: renderIssuesSortByList(),
              });
            }
          }}
        />
      </View>
      <ModalPortal onHide={() => updateModalChildren(null)}>
        {modalChildren}
      </ModalPortal>
    </>
  ) : null;
};


export default React.memo(IssuesSortBy);
