import React, {View, Text, TouchableOpacity} from 'react-native';
import styles from './issue-list__menu.styles';

const CURRENT_YEAR = (new Date()).getFullYear();

export default class IssueListMenu extends React.Component {
  render() {
    return <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.logOutButton} onPress={() => this.props.onLogOut()}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.menuFooter}>
        <Text style={styles.footerText}>YouTrack Mobile</Text>
        <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  }
}
