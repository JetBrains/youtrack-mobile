/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal, Switch, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import getTopPadding from '../header/header__top-padding';
import styles from '../debug-view/debug-view.styles';
import {closeFeaturesView, setEnabledFeatures} from '../../actions/app-actions';
import FeaturesList from './features-list';

type Props = {
  show: boolean,
  features: Array<string>,
  onHide: Function,
  setFeatures: Function
};

const storageKey = 'experimentalFeatures';

export class FeaturesView extends Component<Props, void> {
  constructor(props: Props) {
    super(props);

    AsyncStorage.getItem(storageKey).then(result => {
      const features = JSON.parse(result) || [];
      props.setFeatures(features);
    });
  }

  persistFeatures = (features: Array<string>) => {
    AsyncStorage.setItem(storageKey, JSON.stringify(features));
  };

  render() {
    const {show, onHide, features, setFeatures} = this.props;
    if (!show) {
      return null;
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={onHide}
      >
        <View style={[styles.container, {paddingTop: getTopPadding()}]}>
          <ScrollView style={{flex: 1, padding: 10}}>
            {Object.keys(FeaturesList).map(featureKey => {
              const featureName = FeaturesList[featureKey];

              const onValueChange = value => {
                const newFeatures = features.filter(f => f !== featureKey);
                if (value) {
                  newFeatures.push(featureKey);
                }

                setFeatures(newFeatures);
                this.persistFeatures(newFeatures);
              };

              return (
                <View key={featureKey} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                  <Text numberOfLines={2} style={{color: 'white', flexShrink: 1}}>{featureName}</Text>
                  <Switch value={features.indexOf(featureKey) !== -1} onValueChange={onValueChange}/>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onHide}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showFeaturesView,
    features: state.app.features,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onHide: () => dispatch(closeFeaturesView()),
    setFeatures: newFeatures => dispatch(setEnabledFeatures(newFeatures))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeaturesView);
