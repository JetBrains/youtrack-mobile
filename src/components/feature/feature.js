/* @flow */
/*global __DEV__*/

import {PureComponent} from 'react';
import {getApi} from '../api/api__instance';
import {connect} from 'react-redux';

type Props = {
  devOnly?: boolean,
  name?: string,
  version?: string,
  fallbackComponent?: Object,

  children: any,
  features: Array<string>
};

function convertToNumber(semverVersion: string) {
  const parts = semverVersion.split('.').reverse();

  return parts.reduce((acc, part, index) => {
    return acc + Number.parseInt(part) * Math.pow(1000, index);
  }, 0);
}

export const checkVersion = (version?: string) => {
  try {
    const {version: serverVersion} = getApi().config;

    if (version) {
      return convertToNumber(serverVersion) >= convertToNumber(version);
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
