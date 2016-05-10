import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import styles from './issue-list__menu.styles';

const CURRENT_YEAR = (new Date()).getFullYear();

const VERSION = process.env.npm_package_version;
const BUILD_NUMBER = process.env.npm_package_config_buildnumber;
const VERSION_STRING = `${VERSION}-${BUILD_NUMBER}`;

export default class IssueListMenu extends React.Component {
  render() {
    const user = this.props.user;
    const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

    return <View style={styles.menuContainer}>

      <View style={styles.profileContainer}>
        <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>

        <Text style={styles.profileName}>{user.name}</Text>

        <TouchableOpacity style={styles.logOutButton} onPress={() => this.props.onLogOut()}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuFooter}>
        <Text style={styles.footerText}>YouTrack Mobile {VERSION_STRING}</Text>
        <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  }
}
