import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import Recaptcha, {RecaptchaRef} from 'react-native-recaptcha-that-works';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Header from 'components/header/header';
import {HIT_SLOP} from 'components/common-styles';
import {IconClose} from 'components/icon/icon';

import styles from './recaptcha.styles';

import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ViewStyleProp} from 'types/Internal';
import {notifyError} from 'components/notification/notification';

interface Props extends React.PropsWithChildren {
  captchaKey?: string | null;
  lang?: string;
  onSubmit: (token: string) => void;
  style?: ViewStyleProp | ViewStyleProp[];
  url: string;
}

const ReCaptcha = ({captchaKey, lang, onSubmit, style, url, children}: Props) => {
  const recaptcha = React.useRef<RecaptchaRef | null>(null);

  const {top}: EdgeInsets = useSafeAreaInsets();

  const onClose = React.useCallback(() => {
    recaptcha.current?.close();
  }, []);

  const onOpen = React.useCallback(() => {
    recaptcha.current?.open();
  }, []);

  return !captchaKey ? null : (
    <View style={style}>
      <Recaptcha
        style={styles.recaptcha}
        ref={recaptcha}
        lang={lang}
        headerComponent={
          <Header
            style={{
              ...styles.header,
              paddingTop: top,
              backgroundColor: styles.header.backgroundColor,
            }}
            leftButton={<IconClose color={styles.link.color} />}
            onBack={onClose}
          />
        }
        siteKey={captchaKey}
        baseUrl={url}
        size="invisible"
        theme="dark"
        onLoad={() => {}}
        onClose={() => {}}
        onError={err => {
          notifyError(err);
        }}
        onExpire={() => {}}
        onVerify={t => {
          onSubmit(t);
        }}
        enterprise={false}
        hideBadge={false}
      />
      <TouchableOpacity hitSlop={HIT_SLOP} onPress={onOpen}>{children}</TouchableOpacity>
    </View>
  );
};

export default React.memo(ReCaptcha);
