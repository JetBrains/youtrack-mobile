/* @flow */
import {View, Text, TouchableOpacity, Image, Linking} from 'react-native';
import React, {Component} from 'react';
import styles from './menu.styles';
import {VERSION_STRING} from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
import getTopPadding from '../../components/header/header__top-padding';
import Drawer from 'react-native-drawer';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import {next, logOut} from '../../components/icon/icon';

const CURRENT_YEAR = (new Date()).getFullYear();

function openPrivacyPolicy() {
  Linking.openURL('https://www.jetbrains.com/company/privacy.html');
}


type Props = {
  children?: ReactElement<any>,
  show: boolean,
  auth: Auth,
  issueQuery: ?string,
  onLogOut: () => any,
  onOpen: () => any,
  onClose: () => any
};

type DefaultProps = {
  onOpen: () => any,
  onClose: () => any
};

export default class Menu extends Component<DefaultProps, Props, void> {
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
    const {auth, onLogOut, issueQuery} = this.props;
    const user = auth.currentUser;
    const backendUrl = auth.config.backendUrl;
    const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

    return <View style={[styles.menuContainer, {paddingTop: getTopPadding()}]}>
      <View style={styles.profileContainer}>
        <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>

        <Text style={styles.profileName}>{user.name}</Text>

        <TouchableOpacity style={styles.logOutButton} onPress={onLogOut}>
          <Image style={styles.logoutIcon} source={logOut}></Image>
        </TouchableOpacity>
      </View>

      <View style={styles.menuItems}>
        <TouchableOpacity activeOpacity={0.4} style={styles.menuItemButton} onPress={this._openIssueList}>
          <View style={styles.menuItemTopLine}>
            <Text style={styles.menuItemText}>Issues</Text>
            <Image style={styles.menuItemIcon} source={next}></Image>
          </View>
          <Text style={styles.menuItemSubtext}>{issueQuery || 'No query'}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.4} style={styles.menuItemButton} onPress={this._openAgileBoard}>
          <View style={styles.menuItemTopLine}>
            <Text style={styles.menuItemText}>Agile Boards</Text>
            <Image style={styles.menuItemIcon} source={next}></Image>
          </View>
          <Text style={styles.menuItemSubtext}>Alpha version</Text>
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
        captureGestures={true}
        panOpenMask={36}
      >
        {children}
      </Drawer>
    );
  }
}
