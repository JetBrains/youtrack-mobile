import {PushNotificationIOS} from 'react-native';

import log from '../log/log';

log.info('PUSH:loaded');

PushNotificationIOS.addEventListener('register', e => log.info('PUSH:register', e));
PushNotificationIOS.addEventListener('registrationError', e => log.info('PUSH:registrationError', e));
PushNotificationIOS.addEventListener('notification', e => log.info('PUSH:notification', e));

PushNotificationIOS.requestPermissions();
