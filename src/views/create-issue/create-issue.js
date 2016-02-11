import React, {ScrollView, View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {UIImagePickerManager} from 'NativeModules';
import {Actions} from 'react-native-router-flux';

export default class CreateIssue extends React.Component {
    constructor() {
        super();
        this.state = {
            summary: null,
            description: null,
            attachments: [],
            project: 'SND' //TODO> project selection
        }
    }

    createIssue() {
        //TODO: convert attachements to multipart/form-data format properly

        this.props.api.createIssue({
                summary: this.state.summary,
                description: this.state.description,
                project: this.state.project
            })
            .then(res => {
                console.info('Issue created', res);
            })
            .catch(err => {
                console.warn('Cannot create issue', err);
            })
    }

    attachFileFromLibrary() {
        UIImagePickerManager.launchImageLibrary({
            title: 'Select attachement'
        }, (res) => {
            console.log('Selected photo to attach', res);
            this.state.attachments.push(res);
            this.setState({attachements: this.state.attachments});
        });
    }

    takePhoto() {
        UIImagePickerManager.launchCamera({
            title: 'Select attachement'
        }, (res) => {
            console.log('Selected photo to attach', res);
            this.setState({attachements: [res]});
        });
    }

    _renderAttahes() {
        return this.state.attachments.map(img => {
            return (
                <TouchableOpacity
                    key={img.uri}
                    onPress={() => Actions.ShowImage({imageUrl: img.uri, imageName: img.path})}
                >
                    <Image style={issueStyles.attachment}
                           source={{uri: img.uri}}/>
                </TouchableOpacity>
            );
        });
    }

    render() {
        return (
            <ScrollView style={styles.container}>
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
                        <View>
                            {this.state.attachments.length > 0 && <ScrollView style={issueStyles.attachesContainer} horizontal={true}>
                                {this._renderAttahes(this.state.attachments)}
                            </ScrollView>}
                        </View>
                        <View style={styles.attachButtonsContainer}>
                            <TouchableOpacity
                                style={styles.attachButton}
                                onPress={this.attachFileFromLibrary.bind(this)}>
                                <Text style={styles.attachButtonText}>Attach file from library...</Text>
                            </TouchableOpacity>
    
                            <TouchableOpacity
                                style={styles.attachButton}
                                onPress={this.takePhoto.bind(this)}>
                                <Text style={styles.attachButtonText}>Take a picture...</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.separator}/>
                </View>
            </ScrollView>
        );
    }
}