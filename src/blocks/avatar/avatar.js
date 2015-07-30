var React = require('react-native');
var {
    Image
    } = React;

const SIZE = 20;
const HTTP_HUB_URL = require('../app/app__config').auth.serverUri;

class Avatar extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        this.loadAvatarUrl(this.props.authorLogin);
    }

    loadAvatarUrl(authorLogin) {
        this.props.api.getUser(authorLogin)
            .then((user) => {
                return this.props.api.getUserFromHub(HTTP_HUB_URL, user.ringId)
                    .then(user => user.avatar.url);
            })
            .then(avatarUrl => this.setState({avatarUrl}))
            .catch(() => {
                console.warn('Cant load user', authorLogin);
            });
    }

    render() {
        return <Image style={this.props.style} source={{uri: this.state.avatarUrl}}/>
    }
}

module.exports = Avatar;