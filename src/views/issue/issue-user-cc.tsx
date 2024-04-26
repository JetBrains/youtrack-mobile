import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FormSelect from 'components/form/form-select-button';
import Select from 'components/select/select';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {issueActions} from 'views/issue/issue';
import {notifyError} from 'components/notification/notification';
import {until} from 'util/util';

import styles from './issue.styles';

import type {AppState} from 'reducers';
import type {CustomError} from 'types/Error';
import type {ISelectProps} from 'components/select/select';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {UserCC, UserHubCC} from 'types/User';
import {ViewStyleProp} from 'types/Internal';

const IssueUsersCC = ({disabled, style}: {disabled: boolean; style?: ViewStyleProp}) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const issue = useSelector((state: AppState) => state.issueState.issue);
  const usersCC = useSelector((state: AppState) => state.issueState.usersCC || []);
  const [selectProps, setSelectProps] = React.useState<ISelectProps | null>(null);
  const [presentation, setPresentation] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (usersCC.length) {
      setPresentation(usersCC.map(u => getEntityPresentation(u)).join(', '));
    }
  }, [usersCC]);

  const loadReporters = async (query: string = '') => {
    const q = `not is:banned ${
      issue.project.restricted ? `and access(project:{${issue.project.name}},with:{Create Issue})` : ''
    } and type:Reporter${query.length === 0 ? '' : ` and ${query}`}`;
    const hubUsers = getApi().user.getHubUsers(
      encodeURIComponent(q),
      'guest,id,name,login,userType(id),profile(avatar(url),email(email))'
    );
    const [error, users] = await until([hubUsers, getApi().issue.getUsersCCSuggest(query)]);
    if (error) {
      notifyError(error as CustomError);
      return [];
    } else {
      return (users[0] || [])
        .map((u: UserHubCC) => ({
          avatarUrl: u.profile.avatar.url,
          email: u.profile.email?.email,
          fullName: u.name,
          login: u.login,
          id: u.id,
          ringId: u.id,
          userType: {id: u.userType.id},
        }))
        .concat(users[1] || []).sort((a: UserCC, b: UserCC) => a.fullName.localeCompare(b.fullName));
    }
  };

  const setReporters = async (users: UserCC[]) => {
    const [error] = await until(getApi().issue.setUsersCC(issue.id, users.map(i => ({...i, id: undefined}))));
    if (error) {
      notifyError(error as CustomError);
    } else {
      dispatch(issueActions.setUsersCC(users));
    }
  };

  return (
    <View style={style}>
      <FormSelect
        textStyle={disabled ? null : styles.link}
        disabled={disabled}
        value={presentation}
        placeholder={usersCC.length ? '' : i18n('No CCs')}
        label={i18n('CCs')}
        onPress={() => {
          setSelectProps({
            multi: true,
            getTitle: getEntityPresentation,
            placeholder: i18n('Filter existing accounts by name or username'),
            header: () => (
              <View style={styles.usersCCSelectHeader}>
                <Text style={styles.usersCCSelectHeaderText}>
                  {i18n(
                    'People added as CCs receive the same notifications that are sent to the person who reported this ticket'
                  )}
                </Text>
              </View>
            ),
            dataSource: async (q: string) => {
              return (await loadReporters(q)).map((u: UserCC) => ({...u, description: u.email}));
            },
            selectedItems: [...usersCC],
            onSelect: async (selected: UserCC[]) => {
              setPresentation(
                new Array<UserCC>()
                  .concat(selected)
                  .map(u => getEntityPresentation(u))
                  .join(', ')
              );
              await setReporters(selected);
              setSelectProps(null);
            },
            onCancel: () => setSelectProps(null),
          });
        }}
      />
      {!!selectProps && <Select {...selectProps} />}
    </View>
  );
};

export default React.memo(IssueUsersCC);
