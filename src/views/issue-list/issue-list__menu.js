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
        <Text>YouTrack Mobile</Text>
        <Text>© 2000—{CURRENT_YEAR} JetBrains</Text>
        <Text>All rights reserved</Text>
      </View>
    </View>
  }
}
