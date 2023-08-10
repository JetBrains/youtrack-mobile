import React from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import IssuesSortBy from './issues__sortby';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconCheck} from 'components/icon/icon';
import {
  IssueSetting,
  issuesSearchSettingMode,
  issuesSettingsIssueSizes,
  issuesSettingsSearch,
} from 'views/issues/index';
import {onSettingsChange} from 'views/issues/issues-actions';

import styles from './issues.styles';

import {AppState} from 'reducers';


const IssuesListSettings = ({
  onQueryUpdate,
  toggleVisibility,
}: {
  onQueryUpdate: (q: string) => void;
  toggleVisibility: (isVisible: boolean) => void;
}): React.JSX.Element => {
  const dispatch = useDispatch();

  const query = useSelector((state: AppState) => state.issueList.query);
  const searchContext = useSelector((state: AppState) => state.issueList.searchContext);
  const settings = useSelector((state: AppState) => state.issueList.settings);
  const user = useSelector((state: AppState) => state.app.user);

  const isQueryMode: boolean = settings.search.mode === issuesSearchSettingMode.query;

  return (
    <BottomSheetModal
      style={styles.settingsModal}
      withHandle={true}
      height={Dimensions.get('window').height - 100}
      snapPoint={450}
      isVisible={true}
      onClose={() => toggleVisibility(false)}
    >
      <>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsItemTitle}>{i18n('Search Input Mode')}</Text>
          {issuesSettingsSearch.map((it: IssueSetting, index: number) => {
            return (
              <TouchableOpacity
                key={`issueSetting${index}`}
                style={styles.settingsRow}
                onPress={() => {
                  dispatch(onSettingsChange({...settings, search: it}));
                }}
              >
                <Text style={styles.settingsItemText}>{it.label}</Text>
                {it.mode === settings.search.mode && <IconCheck
                  size={20}
                  color={styles.link.color}
                />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.settingsSeparator}/>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsItemTitle}>
            {isQueryMode && i18n('Sort Order')}
            {!isQueryMode && i18n('Filter Settings')}
          </Text>
          {isQueryMode && <IssuesSortBy
            onOpen={() => toggleVisibility(false)}
            context={searchContext}
            onApply={(q: string) => onQueryUpdate(q)}
            query={query}
          />}
          {!isQueryMode && <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => {

              //TODO
            }}
          >
            <Text
              numberOfLines={1}
              style={styles.settingsItemText}
            >
              {user?.profiles?.appearance?.liteUiFilters?.join(', ')}
            </Text>
            <IconAngleRight
              size={19}
              color={styles.settingsItemIcon.color}
            />
          </TouchableOpacity>}
        </View>
        <View style={styles.settingsSeparator}/>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsItemTitle}>{i18n('Preview Size')}</Text>
          {issuesSettingsIssueSizes.map((it: IssueSetting, index: number) => {
            const isActive: boolean = it.mode === settings.view.mode;
            return (
              <TouchableOpacity
                key={`sizeSetting${index}`}
                disabled={isActive}
                style={styles.settingsRow}
                onPress={() => {
                  dispatch(onSettingsChange({...settings, view: it}));
                  toggleVisibility(false);
                }}
              >
                <Text
                  style={styles.settingsItemText}>
                  {`${it.label} `}
                </Text>
                {isActive && <IconCheck
                  size={20}
                  color={styles.link.color}
                />}
              </TouchableOpacity>
            );
          })
          }
        </View>
      </>
    </BottomSheetModal>
  );
};


export default React.memo(IssuesListSettings);

