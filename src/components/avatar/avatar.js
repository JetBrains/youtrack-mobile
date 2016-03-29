import React, {Image, PropTypes} from 'react-native';

export default class Avatar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.loadAvatarUrl(this.props.userRingId);
  }

  loadAvatarUrl(userRingId) {
    this.props.api.getUserFromHub(userRingId)
      .then(user => user.avatar.url)
      .then(avatarUrl => this.setState({avatarUrl}))
      .catch(() => {
        console.warn('Cant load user', userRingId);
      });
  }

  render() {
    return <Image style={this.props.style} source={{uri: this.state.avatarUrl}}/>
  }
}

Avatar.propTypes = {
  api: PropTypes.object.isRequired,
  userRingId: PropTypes.string.isRequired
};
