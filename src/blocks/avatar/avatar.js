var React = require('react-native');
var {
    Image
    } = React;

const SIZE = 20;
const HTTP_HUB_URL = 'http://hackathon15.labs.intellij.net:8080/hub';

class Avatar extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        this.loadAvatarUrl(this.props.authorName);
    }

    loadAvatarUrl(authorName) {
        this.props.api.getUser(HTTP_HUB_URL, authorName)
            .then((user) => {
                this.setState({avatarUrl: user.avatar.url});
            })
            .catch(() => {
                console.warn('Cant load user', authorName);
            });
    }

    render() {
        return <Image style={this.props.style} source={{uri: this.state.avatarUrl}}/>
    }
}

module.exports = Avatar;