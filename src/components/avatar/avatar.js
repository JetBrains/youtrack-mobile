import React, {Image, PropTypes} from 'react-native';

export default class Avatar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.loadAvatarUrl(this.props.userLogin);
  }

  loadAvatarUrl(authorLogin) {
    this.props.api.getUser(authorLogin)
      .then((user) => {
        return this.props.api.getUserFromHub(user.ringId)
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

Avatar.propTypes = {
  userLogin: PropTypes.string.isRequired
};
