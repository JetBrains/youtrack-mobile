import React from 'react';
import {Text, View} from 'react-native';

import ReCaptcha from 'components/recaptcha/recaptcha';
import {IconCheckboxBlank, IconCheckboxChecked} from 'components/icon/icon';

import styles from './helpdesk-feedback.styles';

import type {ViewStyleProp} from 'types/Internal';

const HelpDeskReCaptcha = ({
  captchaURL,
  captchaPublicKey,
  lang,
  onSubmit,
  style,
}: {
  captchaURL: string;
  captchaPublicKey?: string;
  lang?: string;
  onSubmit: (t: string) => void;
  style?: ViewStyleProp | ViewStyleProp[],
}) => {
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const Icon = captchaToken ? IconCheckboxChecked : IconCheckboxBlank;

  return (
    <View style={style}>
      <ReCaptcha
        captchaKey={captchaPublicKey}
        lang={lang}
        url={captchaURL}
        onSubmit={(token: string) => {
          setCaptchaToken(token);
          onSubmit(token);
        }}
      >
        <View style={styles.row}>
          <Icon size={22} color={styles.captchaCheckbox.color} />
          <Text style={styles.captcha}>reCaptcha*</Text>
        </View>
      </ReCaptcha>
    </View>
  );
};

export default React.memo(HelpDeskReCaptcha);
