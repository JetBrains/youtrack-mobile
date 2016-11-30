import {View, Text, TouchableOpacity, Image, Linking} from 'react-native';
import React from 'react';
import styles from './issue-list__menu.styles';
import {VERSION_STRING} from '../../components/usage/usage';
import {formatYouTrackURL} from '../../components/config/config';
import getTopPadding from '../../components/header/header__top-padding';

const CURRENT_YEAR = (new Date()).getFullYear();

function openPrivacyPolicy() {
  Linking.openURL('https://www.jetbrains.com/company/privacy.html');
}

export default class IssueListMenu extends React.Component {
  render() {
    const user = this.props.user;
    const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

    return <View style={[styles.menuContainer, {marginTop: getTopPadding()}]}>

      <View style={styles.profileContainer}>
        <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>

        <Text style={styles.profileName}>{user.name}</Text>

        <TouchableOpacity style={styles.logOutButton} onPress={() => this.props.onLogOut()}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuFooter}>
        <Text style={styles.footerText}>YouTrack Mobile {VERSION_STRING}</Text>
        <Text style={styles.footerText}>{formatYouTrackURL(this.props.backendUrl)}</Text>

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
}
