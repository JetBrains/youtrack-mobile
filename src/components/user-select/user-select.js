import React, {Text, ScrollView, View, TouchableOpacity, TextInput, Image, PropTypes} from 'react-native';
import styles from './user-select.styles';
import Header from '../header/header';

export default class UserSelect extends React.Component {
    constructor() {
        super();
        this.state = {
            query: '',
            users: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        };
    }

    _onSearch(query) {
        this.props.dataSource(query)
            .then(users => this.setState({users}));
    }

    _renderRow(user) {
        return (
            <TouchableOpacity key={user} style={styles.row} onPress={() => this.props.onSelect(user)}>
                <Image
                    style={styles.avatar}
                    source={{uri: 'http://lorempixel.com/64/64/'}}
                />
                <Text style={styles.userName}>Some User</Text>
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
                        placeholder="Search user"
                        returnKeyType="search"
                        autoCorrect={false}
                        onSubmitEditing={(e) => this._onSearch(e.nativeEvent.text)}
                        value={this.state.query}
                        onChangeText={(text) => this.setState({query: text})}
                        style={styles.searchInput}/>
                </View>
                <View style={styles.separator}/>
                <ScrollView>
                    {this.state.users.map(user => this._renderRow(user))}
                </ScrollView>
            </View>
        );
    }
}

UserSelect.propTypes = {
    dataSource: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    title: PropTypes.string
};
