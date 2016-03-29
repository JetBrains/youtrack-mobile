import React, {Text, ScrollView, View, TouchableOpacity, TextInput, PropTypes} from 'react-native';
import styles from './select.styles';
import Header from '../header/header';
import Avatar from '../avatar/avatar';
import ColorField from '../color-field/color-field';

export default class UserSelect extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      items: null
    };
  }

  componentDidMount() {
    this._onSearch(this.state.query);
  }

  _onSearch(query) {
    this.props.dataSource(query)
      .then(items => this.setState({items}));
  }

  _renderTitle(item) {
    if (item.color) {
      return <ColorField field={{name: this.props.getTitle(item), color: item.color}} fullText={true}/>
    }
    return <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>
  }

  _renderRow(item) {
    return (
      <TouchableOpacity key={item.id} style={styles.row} onPress={() => this.props.onSelect(item)}>
        {item.ringId && <Avatar style={styles.itemIcon} userRingId={item.ringId} api={this.props.api}/>}
        {this._renderTitle(item)}
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header leftButton={<Text>Cancel</Text>} onBack={this.props.onCancel.bind(this)}>
          <Text>{this.props.title}</Text>
        </Header>
        <View style={styles.inputWrapper}>
          <TextInput
            autoFocus={true}
            placeholder="Search item"
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={(e) => this._onSearch(e.nativeEvent.text)}
            value={this.state.query}
            onChangeText={(text) => this.setState({query: text})}
            style={styles.searchInput}/>
        </View>
        <View style={styles.separator}/>
        {this.state.items && <ScrollView>
          {this.state.items.map(item => this._renderRow(item))}
        </ScrollView>}
      </View>
    );
  }
}

UserSelect.propTypes = {
  dataSource: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  title: PropTypes.string,
  api: PropTypes.object
};
