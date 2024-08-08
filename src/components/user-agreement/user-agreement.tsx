import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import MarkdownView from 'components/wiki/markdown-view';
import ModalView from 'components/modal-view/modal-view';
import {acceptUserAgreement, declineUserAgreement} from 'actions/app-actions';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';

import styles from './user-agreement.styles';

import type {AppState} from 'reducers';
import type {ReduxThunkDispatch} from 'types/Redux';

const UserAgreementView = () => {
  const dispatch: ReduxThunkDispatch = useDispatch();

  const show = useSelector((state: AppState) => state.app.showUserAgreement);
  const agreement = useSelector((state: AppState) => state.app.endUserAgreement);

  if (!show || !agreement?.text) {
    return null;
  }

  return (
    <ModalView animationType="fade" transparent={true} onRequestClose={() => {}}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.markdownScroll}>
          <MarkdownView>{agreement.text}</MarkdownView>
        </ScrollView>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              dispatch(declineUserAgreement());
            }}
          >
            <Text style={styles.buttonText}>{i18n('Decline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            style={styles.button}
            onPress={() => {
              dispatch(acceptUserAgreement());
            }}
          >
            <Text style={styles.buttonText}>{i18n('Accept')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalView>
  );
};

export default React.memo(UserAgreementView);
