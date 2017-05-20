/* @flow */
import {View, ScrollView, Text, TouchableOpacity, Image, Linking, Dimensions} from 'react-native';
import React, {Component} from 'react';
import styles from './menu.styles';
import {VERSION_STRING} from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
import getTopPadding from '../../components/header/header__top-padding';
import Drawer from 'react-native-drawer';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import {next, logOut as logOutIcon} from '../../components/icon/icon';
import {connect} from 'react-redux';
import {logOut, openMenu, closeMenu} from '../../actions';

const CURRENT_YEAR = (new Date()).getFullYear();
const MENU_WIDTH = 280;

function openPrivacyPolicy() {
  Linking.openURL('https://www.jetbrains.com/company/privacy.html');
}


type Props = {
  children?: ReactElement<any>,
  show: boolean,
  auth: Auth,
  issueQuery: ?string,
  onBeforeLogOut: () => any,
  onLogOut: () => any,
  onOpen: () => any,
  onClose: () => any
};

type DefaultProps = {
  onOpen: () => any,
  onClose: () => any,
  onBeforeLogOut: () => any
};

export class Menu extends Component<DefaultProps, Props, void> {
  static defaultProps = {
    onOpen: () => {},
    onClose: () => {},
    onBeforeLogOut: () => {}
  };

  _openIssueList = () => {
    this.props.onClose();
    Router.IssueList({auth: this.props.auth});
  }

  _openAgileBoard = () => {
    this.props.onClose();
    Router.AgileBoard({auth: this.props.auth});
  }

  _logOut = () => {
    this.props.onBeforeLogOut();
    this.props.onLogOut();
    this.props.onClose();
  }

  _renderMenu() {
    const {height} = Dimensions.get('window');
    const {auth, issueQuery} = this.props;
    if (!auth) { //TODO: menu renders right after logOut by some reason.
      return null;
    }
    const user = auth.currentUser;
    const backendUrl = auth.config.backendUrl;
    const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

    return (
      <ScrollView>
        <View style={[styles.menuContainer, {paddingTop: getTopPadding(), minHeight: height}]}>
          <View style={styles.profileContainer}>
            <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>

            <Text style={styles.profileName}>{user.name}</Text>

            <TouchableOpacity style={styles.logOutButton} onPress={this._logOut}>
              <Image style={styles.logoutIcon} source={logOutIcon}></Image>
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

          <View style={styles.flexSpacer}/>

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
        </View>
      </ScrollView>
    );
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
        openDrawerOffset={viewport => viewport.width - MENU_WIDTH}
        captureGestures={true}
        panOpenMask={12}
      >
        {children}
      </Drawer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showMenu,
    auth: state.app.auth,
    issueQuery: state.issueList.query,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onOpen: () => dispatch(openMenu()),
    onClose: () => dispatch(closeMenu()),
    onLogOut: () => dispatch(logOut())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

