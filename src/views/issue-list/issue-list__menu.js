import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import styles from './issue-list__menu.styles';
import {VERSION_STRING} from '../../components/usage/usage';

const CURRENT_YEAR = (new Date()).getFullYear();

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
        <Text style={styles.footerText}>{this.props.backendUrl}</Text>
        <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>;
  }
}
