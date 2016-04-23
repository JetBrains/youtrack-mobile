import React, {Text, Image, ScrollView, View, TouchableOpacity, TextInput, PropTypes} from 'react-native';
import styles from './select.styles';
import Header from '../header/header';
import ColorField from '../color-field/color-field';

export default class Select extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      items: null,
      filteredItems: [],
      selectedItems: []
    };
  }

  componentDidMount() {
    const selectedItems = this.props.selectedItems ? this.props.selectedItems : [];
    this.setState({selectedItems});
    this._loadItems(this.state.query);
  }


  _loadItems(query) {
    this.props.dataSource(query)
      .then(items => this.setState({items}))
      .then(() => this._onSearch(query));
  }

  _onSearch(query) {
    query = query || '';
    const filteredItems = (this.state.items || []).filter(item => {
      const label = this.props.getTitle(item) || '';
      return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    this.setState({filteredItems});
  }

  _renderTitle(item) {
    if (item.color) {
      return <ColorField text={this.props.getTitle(item)} color={item.color} fullText={true}/>
    }
    return <Text style={styles.itemTitle}>{this.props.getTitle(item)}</Text>
  }

  _isSelected(item) {
    return this.state.selectedItems.some(selectedItem => item.id === selectedItem.id);
  }

  _onTouchItem(item) {
    if (!this.props.multi) {
      return this.props.onSelect(item);
    }

    if (this._isSelected(item)) {
      this.setState({selectedItems: this.state.selectedItems.filter(it => it.id !== item.id)})
    } else {
      this.setState({selectedItems: this.state.selectedItems.concat(item)})
    }
  }

  _onSave() {
    return this.props.onSelect(this.state.selectedItems);
  }

  _renderRow(item) {
    return (
      <TouchableOpacity key={item.id} style={styles.row} onPress={() => this._onTouchItem(item)}>
        {item.avatarUrl && <Image style={styles.itemIcon} source={{uri: item.avatarUrl}}/>}

        {this._isSelected(item) && <View style={styles.selectedMark}></View>}

        {this._renderTitle(item)}
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={this.props.onCancel.bind(this)}
          rightButton={this.props.multi ? <Text>Apply</Text> : null}
          onRightButtonClick={this._onSave.bind(this)}>
          <Text>{this.props.title}</Text>
        </Header>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Search item"
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={(e) => this._onSearch(this.state.query)}
            value={this.state.query}
            onChangeText={(text) => {
              this.setState({query: text});
              this._onSearch(text);
            }}
            style={styles.searchInput}/>
        </View>
        <View style={styles.separator}/>
        {this.state.filteredItems && <ScrollView>
          {this.state.filteredItems.map(item => this._renderRow(item))}
        </ScrollView>}
      </View>
    );
  }
}

Select.propTypes = {
  dataSource: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedItems: PropTypes.array,
  title: PropTypes.string,
  multi: PropTypes.bool,
  api: PropTypes.object
};
