import React, {View, Text, TextInput, TouchableOpacity} from 'react-native'
import styles from './create-issue.styles';
import Header from '../../components/header/header';

export default class CreateIssue extends React.Component {
    constructor() {
        super();
        this.state = {
            summary: null,
            description: null,
            project: 'SND' //TODO> project selection
        }
    }
    createIssue() {
        this.props.api.createIssue(this.state)
            .then(res => {
                console.info('Issue created', res);
            })
            .catch(err => {
                console.warn('Cannot create issue', err);
            })
    }

    attachFileFromLibrary() {

    }

    render() {
        return (
            <View style={styles.container}>
                <Header leftButton={<Text>Cancel</Text>}
                        rightButton={<Text>Create</Text>}
                        onRightButtonClick={this.createIssue.bind(this)}>
                    <Text>New Issue</Text>
                </Header>
                <View>
                    <View>
                        <TextInput
                            autoFocus={true}
                            style={styles.summaryInput}
                            placeholder="Summary"
                            returnKeyType="next"
                            onSubmitEditing={() => this.refs.description.focus()}
                            onChangeText={(summary) => this.setState({summary})}/>
                    </View>
                    <View style={styles.separator}/>
                    <View>
                        <TextInput
                            ref="description"
                            style={styles.descriptionInput}
                            multiline={true}
                            placeholder="Description"
                            onChangeText={(description) => this.setState({description})}/>
                    </View>
                    <View style={styles.attachesContainer}>
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={this.attachFileFromLibrary.bind(this)}>
                            <Text style={styles.attachButtonText}>Attach file from library...</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={this.attachFileFromLibrary.bind(this)}>
                            <Text style={styles.attachButtonText}>Take a picture...</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separator}/>
                </View>
            </View>
        );
    }
}