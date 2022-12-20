import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {View as AnimatedView} from 'react-native-animatable';
import IssuesSortByList from './issues__sortby_list';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import {doAssist, getSortPropertyName} from './issues__sortby-helper';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import styles from './issues.styles';
import type {Folder} from 'flow/User';
import type {IssueFieldSortProperty, SearchSuggestions} from 'flow/Sorting';
type Props = {
  context: Folder;
  onApply: (query: string) => any;
  query: string;
};
const MAX_NUMBER_SORTING_PROPERTIES: number = 4;

const IssuesSortBy = (props: Props) => {
  const [selectedSortProperties, updateSelectedSortProperties] = useState([]);
  const [modalChildren, updateModalChildren] = useState(null);
  const mounted: {
    current: boolean;
  } = useRef(false);
  const loadSortingProperties = useCallback(
    (context: Folder, query: string) => {
      doAssist({
        context,
        query,
      }).then((searchSuggestions: SearchSuggestions | null | undefined) => {
        if (mounted.current === true && searchSuggestions?.sortProperties) {
          updateSelectedSortProperties(searchSuggestions.sortProperties);
        }
      });
    },
    [],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    loadSortingProperties(props.context, props.query);
  }, [loadSortingProperties, props.context, props.query]);

  const getUniqueSortProperties = (
    sortProperties: Array<IssueFieldSortProperty>,
  ): Array<IssueFieldSortProperty> => {
    const sortPropertiesIds = {};
    return sortProperties.filter((it: IssueFieldSortProperty) =>
      sortPropertiesIds[it.id] ? false : (sortPropertiesIds[it.id] = true),
    );
  };

  const createSortButtonTitle = (
    sortProperties: Array<IssueFieldSortProperty>,
  ): string => {
    const uniqueSortProperties = getUniqueSortProperties(sortProperties);
    return uniqueSortProperties
      .slice(0, MAX_NUMBER_SORTING_PROPERTIES)
      .map((it: IssueFieldSortProperty) => getSortPropertyName(it))
      .join(', ');
  };

  const issuesSortByListOnBack: () => void = () => {
    if (isSplitView()) {
      updateModalChildren(null);
    } else {
      Router.pop(true);
    }
  };

  return selectedSortProperties?.length ? (
    <>
      <AnimatedView
        testID="test:id/issuesSortBy"
        accessibilityLabel="issuesSortBy"
        accessible={true}
        useNativeDriver
        duration={500}
        animation="fadeIn"
      >
        <TouchableOpacity
          style={[styles.toolbarAction, styles.toolbarActionSortBy]}
          onPress={() => {
            const issuesSortByList = (
              <IssuesSortByList
                context={props.context}
                onApply={(
                  sortProperties: Array<IssueFieldSortProperty>,
                  query: string,
                ) => {
                  updateSelectedSortProperties(sortProperties);
                  props.onApply(query);

                  if (sortProperties.length === 0) {
                    issuesSortByListOnBack();
                  }
                }}
                onBack={issuesSortByListOnBack}
                query={props.query}
                selectedSortProperties={selectedSortProperties}
              />
            );

            if (isSplitView()) {
              updateModalChildren(issuesSortByList);
            } else {
              Router.PageModal({
                children: issuesSortByList,
              });
            }
          }}
        >
          <Text
            style={[styles.toolbarText, styles.toolbarSortByText]}
            numberOfLines={2}
          >
            {i18n('Sorted by')} {createSortButtonTitle(selectedSortProperties)}
          </Text>
          <IconAngleDown size={20} color={styles.toolbarText.color} />
        </TouchableOpacity>
      </AnimatedView>
      <ModalPortal onHide={() => updateModalChildren(null)}>
        {modalChildren}
      </ModalPortal>
    </>
  ) : null;
};

export default React.memo<Props>(IssuesSortBy) as React$AbstractComponent<
  Props,
  unknown
>;