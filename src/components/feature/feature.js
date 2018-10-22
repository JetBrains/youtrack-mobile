/* @flow */
/*global __DEV__*/

import {PureComponent} from 'react';
import {getApi} from '../api/api__instance';

type Props = {
  children: any,
  devOnly?: boolean,
  version?: string
};

export const checkVersion = (version?: string) => {
  try {
    const {version: serverVersion} = getApi().config;

    if (version) {
      const testParts = version.split('.');
      const serverParts = serverVersion.split('.');

      return serverParts.every((_, index) => +serverParts[index] >= +testParts[index]);
    } else {
      return true;
    }
  } catch(e) {
    return false;
  }
};

export const checkDev = () => __DEV__;

export default class Feature extends PureComponent<Props, void> {
  check() {
    return checkVersion(this.props.version) && (this.props.devOnly ? checkDev() : true);
  }

  render() {
    return this.check() ? this.props.children : null;
  }
}
