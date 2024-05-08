import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import ColorField from 'components/color-field/color-field';
import FormSelect from 'components/form/form-select-button';
import IconEarth from 'components/icon/assets/earth.svg';
import SelectSectioned from 'components/select/select-sectioned';
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
import type {ViewStyleProp} from 'types/Internal';

const IssueUsersCC = ({disabled, style}: {disabled: boolean; style?: ViewStyleProp}) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const issue = useSelector((state: AppState) => state.issueState.issue);
  const usersCC = useSelector((state: AppState) => state.issueState.usersCC || []);
  const currentUser = useSelector((state: AppState) => state.app.user!);
  const [selectProps, setSelectProps] = React.useState<ISelectProps | null>(null);
  const [presentation, setPresentation] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (usersCC.length) {
      setPresentation(usersCC.map(u => getEntityPresentation(u)).join(', '));
    }
  }, [usersCC]);

  const loadReporters = async (query: string = ''): Promise<UserCC[]> => {
    const q = `not is:banned ${
      issue.project.restricted ? `and access(project:{${issue.project.name}},with:{Create Issue})` : ''
    } and type:Reporter${query.length === 0 ? '' : ` and ${query}`}`;
    const hubUsers = getApi().user.getHubUsers(
      encodeURIComponent(q),
      'guest,id,name,login,userType(id),profile(avatar(url),email(email))'
    );
    const [error, users] = await until<[UserHubCC[], UserCC[]]>([hubUsers, getApi().issue.getUsersCCSuggest(query)]);
    if (error) {
      notifyError(error as CustomError);
      return [];
    } else {
      const hUsers: UserCC[] = (users[0] || []).map(u => ({
        avatarUrl: u.profile.avatar.url,
        email: u.profile.email?.email,
        fullName: u.name,
        name: u.name,
        localizedName: null,
        login: u.login,
        id: u.id,
        ringId: u.id,
        userType: {id: u.userType.id},
        isReporter: false,
      }));

      return hUsers
        .concat(users[1] || [])
        .map(u => ({
          ...u,
          isReporter: u.userType.id === 'REPORTER',
        }))
        .sort((a: UserCC, b: UserCC) => a.fullName.localeCompare(b.fullName));
    }
  };

  const setReporters = async (users: UserCC[]) => {
    const [error] = await until(
      getApi().issue.setUsersCC(
        issue.id,
        users.map(i => ({...i, id: undefined})),
      )
    );
    if (error) {
      notifyError(error as CustomError);
    } else {
      dispatch(issueActions.setUsersCC(users));
    }
  };

  const createHeader = () => (
    <View style={styles.selectHeader}>
      <Text style={styles.selectHeaderText}>
        {i18n(
          'People added as CCs receive the same notifications that are sent to the person who reported this ticket'
        )}
      </Text>
      <Text style={[styles.selectHeaderText, styles.selectHeaderTextWarn]}>
        {i18n('You can only CC a maximum of 5 reporters per ticket')}
      </Text>
    </View>
  );

  return (
    <View style={style}>
      <FormSelect
        textStyle={disabled ? null : styles.link}
        disabled={disabled}
        value={presentation}
        placeholder={usersCC.length ? '' : i18n('No CCs')}
        placeholderTextColor={styles.link.color}
        label={i18n('CCs')}
        onPress={() => {
          setSelectProps({
            multi: true,
            getTitle: getEntityPresentation,
            titleRenderer: (it: UserCC) => (
              <Text style={styles.reporter}>
                {`${getEntityPresentation(it)} `}
                {it.isReporter ? (
                  <ColorField style={styles.reporterTag} text={i18n('Reporter')} fullText={true}>
                    <IconEarth width={12} height={12} color={styles.reporterTag.color} />
                    <Text> </Text>
                  </ColorField>
                ) : null}
              </Text>
            ),
            placeholder: i18n('Filter existing accounts by name or username'),
            header: createHeader,
            dataSource: async (q: string) => {
              return (await loadReporters(q))
                .map((u: UserCC) => ({...u, description: u.email}))
                .reduce(
                  (acc: Array<{title: string; data: UserCC[]}>, u) => {
                    const usr = {...u, description: u.email};
                    if (u.ringId === currentUser.ringId) {
                      acc[0].data.push(usr);
                    } else {
                      acc[u.isReporter ? 1 : 2].data.push(usr);
                    }
                    return acc;
                  },
                  [
                    {title: i18n('CC me'), data: []},
                    {title: i18n('Reporter'), data: []},
                    {title: ' ', data: []},
                  ]
                )
                .filter(it => it.data.length > 0);
            },
            selectedItems: usersCC,
            isSelectionDisabled: (selected: UserCC[], current: UserCC) => {
              if (selected.some(u => u.ringId === current.ringId)) {
                return false;
              }
              return [...selected, current].filter(u => u.isReporter).length > 5;
            },
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
      {!!selectProps && <SelectSectioned {...selectProps} />}
    </View>
  );
};

export default React.memo(IssueUsersCC);
