/* @flow */
import {View, Text, TouchableOpacity, Image, Linking} from 'react-native';
import React, {Component} from 'react';
import styles from './menu.styles';
import {VERSION_STRING} from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
import getTopPadding from '../../components/header/header__top-padding';
import Drawer from 'react-native-drawer';
import Router from '../../components/router/router';

const CURRENT_YEAR = (new Date()).getFullYear();

function openPrivacyPolicy() {
  Linking.openURL('https://www.jetbrains.com/company/privacy.html');
}


type Props = {
  show: boolean,
  auth: Auth,
  onLogOut: () => any,
  onOpen: () => any,
  onClose: () => any
};

type State = {
};

export default class Menu extends Component {
  props: Props;
  state: State;

  static defaultProps = {
    onOpen: () => {},
    onClose: () => {},
  };

  _openIssueList = () => {
    Router.IssueList({auth: this.props.auth});
  }

  _openAgileBoard = () => {
    Router.AgileBoard({auth: this.props.auth});
  }

  _renderMenu() {
    const {auth, onLogOut} = this.props;
    const user = auth.currentUser;
    const backendUrl = auth.config.backendUrl;
    const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

    return <View style={[styles.menuContainer, {marginTop: getTopPadding()}]}>

      <View style={styles.profileContainer}>
        <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>

        <Text style={styles.profileName}>{user.name}</Text>

        <TouchableOpacity style={styles.logOutButton} onPress={onLogOut}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuItems}>
        <TouchableOpacity style={styles.menuItemButton} onPress={this._openIssueList}>
          <Text style={styles.menuItemText}>Issues</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItemButton} onPress={this._openAgileBoard}>
          <Text style={styles.menuItemText}>Agile Board <Text style={styles.label}>(Alpha)</Text></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuFooter}>
        <Text style={styles.footerText}>YouTrack Mobile {VERSION_STRING}</Text>
        <Text style={styles.footerText}>{formatYouTrackURL(backendUrl)}</Text>

        <View style={styles.spacer}></View>
        <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text style={styles.footerText}>All rights reserved</Text>

        <View style={styles.spacer}></View>
        <TouchableOpacity style={styles.buttonLink} onPress={openPrivacyPolicy}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>;
  }

  render() {
    const {children, show, onOpen, onClose} = this.props;

    return (
      <Drawer
        type="static"
        open={show}
        content={this._renderMenu()}
        tapToClose={true}
        onOpen={onOpen}
        onClose={onClose}
        openDrawerOffset={1 / 4}
      >
        {children}
      </Drawer>
    );
  }
}
