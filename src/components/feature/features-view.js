/* @flow */
import React, {Component} from 'react';
import {View, Text, Switch, ScrollView} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import FeaturesList from './features-list';
import Header from '../header/header';
import ModalView from '../modal-view/modal-view';

import styles from './feature-view.style';
import type {UITheme} from '../../flow/Theme';
import {IconClose} from '../icon/icon';

type Props = {
  features: Array<string>,
  onHide: Function,
  setFeatures: Function,
  uiTheme: UITheme
};

const experimentalFeaturesStorageKey = 'experimentalFeatures';

export default class FeaturesView extends Component<Props, void> {
  constructor(props: Props) {
    super(props);

    AsyncStorage.getItem(experimentalFeaturesStorageKey).then(result => {
      const features = JSON.parse(result) || [];
      props.setFeatures(features);
    });
  }

  persistFeatures = (features: Array<string>) => {
    AsyncStorage.setItem(experimentalFeaturesStorageKey, JSON.stringify(features));
  };

  render() {
    const {onHide, features, setFeatures, uiTheme} = this.props;
    const switchProps = {
      width: 40,
      thumbColor: uiTheme.colors.$link,
      trackColor: uiTheme.colors.$linkLight,
    };

    return (
      <ModalView
        animationType="slide"
        onRequestClose={onHide}
      >
        <View style={styles.container}>
          <Header
            leftButton={<IconClose size={21} color={styles.link.color}/>}
            onBack={onHide}
            title="Features" style={styles.elevation1}/>

          <ScrollView
            style={styles.featuresList}
          >
            {Object.keys(FeaturesList).map(featureKey => {
              const featureName = featureKey;

              const onValueChange = value => {
                const newFeatures = features.filter(f => f !== featureKey);
                if (value) {
                  newFeatures.push(featureKey);
                }

                setFeatures(newFeatures);
                this.persistFeatures(newFeatures);
              };

              return (
                <View
                  key={featureKey}
                  style={styles.featuresListItem}
                >
                  <Text style={styles.featuresListItemText} numberOfLines={2}>{featureName}</Text>
                  <Switch
                    {...switchProps}
                    value={features.indexOf(featureKey) !== -1}
                    onValueChange={onValueChange}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ModalView>
    );
  }
}
