/* @flow */
/*global __DEV__*/

import {PureComponent} from 'react';
import {getApi} from '../api/api__instance';
import connect from 'react-redux/es/connect/connect';

type Props = {
  devOnly?: boolean,
  name?: string,
  version?: string,
  fallbackComponent?: Object,

  children: any,
  features: Array<string>
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

class Feature extends PureComponent<Props, void> {
  check() {
    const {name, features, version, devOnly} = this.props;

    const featureEnabled = name ? features.indexOf(name) !== -1 : true;

    return featureEnabled && checkVersion(version) && (devOnly ? checkDev() : true);
  }

  render() {
    const {fallbackComponent, children} = this.props;

    const fallback = fallbackComponent ? fallbackComponent : null;

    return this.check() ? children : fallback;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    features: state.app.features,
    ...ownProps
  };
};

export default connect(mapStateToProps)(Feature);
