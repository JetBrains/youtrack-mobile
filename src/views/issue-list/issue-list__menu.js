import React, {View, Text, TouchableOpacity} from 'react-native';
import styles from './issue-list__menu.styles';

const CURRENT_YEAR = (new Date()).getFullYear();

const VERSION = process.env.npm_package_version;
const BUILD_NUMBER = process.env.BUILD_NUMBER;

export default class IssueListMenu extends React.Component {
  render() {
    return <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.logOutButton} onPress={() => this.props.onLogOut()}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.menuFooter}>
        <Text style={styles.footerText}>YouTrack Mobile {VERSION}{BUILD_NUMBER ? `-${BUILD_NUMBER}` : ''}</Text>
        <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  }
}
