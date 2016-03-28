import React, {Text, ScrollView, View, TouchableOpacity, TextInput, Image, PropTypes} from 'react-native';
import styles from './select.styles';
import Header from '../header/header';

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

  _renderRow(item) {
    return (
      <TouchableOpacity key={item.id} style={styles.row} onPress={() => this.props.onSelect(item)}>
        {item.icon && <Image
          style={styles.itemIcon}
          source={{uri: 'http://lorempixel.com/64/64/'}}
        />}
        <Text style={styles.itemTitle}>{item[this.props.titleField]}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header>
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
  title: PropTypes.string
};
