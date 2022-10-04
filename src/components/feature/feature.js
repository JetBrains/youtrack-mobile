/* @flow */
/*global __DEV__*/

import {useSelector} from 'react-redux';

import featureList from './features-list';
import {getApi} from '../api/api__instance';

type Props = {
  children: any,
  devOnly?: boolean,
  fallbackComponent?: React$Element<any>,
  featureName?: string,
  version?: string,
};

function convertToNumber(semverVersion: string) {
  const parts = semverVersion.split('.').reverse();

  return parts.reduce((acc, part, index) => {
    return acc + Number.parseInt(part) * Math.pow(1000, index);
  }, 0);
}

export const checkVersion = (versionToCheck?: string, returnOnThrow?: boolean): boolean => {
  try {
    const {version} = getApi().config;

    if (versionToCheck && version) {
      return convertToNumber(version) >= convertToNumber(versionToCheck);
    } else {
      return false;
    }
  } catch (e) {
    return returnOnThrow !== undefined ? returnOnThrow : false;
  }
};

export const checkDev = (): boolean => __DEV__;

export const FEATURE_VERSION = featureList;

const Feature = (props: Props):
  | any
  | null
  | {
    +key: React$Key | null,
    +props: React$ElementProps<any>,
    +ref: any,
    +type: any,
  } => {
  const {fallbackComponent = null, children, featureName, version, devOnly} = props;
  const features: Array<string> = useSelector(state => state.app.features);

  const isFeatureEnabled: boolean = featureName ? features.indexOf(featureName) !== -1 : true;
  const isShown: boolean = isFeatureEnabled && checkVersion(version) && (devOnly ? checkDev() : true);
  return isShown ? children : fallbackComponent;
};


export default Feature;
