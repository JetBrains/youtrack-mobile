import React, {PureComponent} from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

import {COLOR_ICON_GREY, COLOR_PINK, COLOR_PLACEHOLDER} from '../variables/variables';

export {default as logo} from './youtrack-logo-512.png';
export {default as arrow} from './arrow.png';
export {default as add} from './add.png';
export {default as addGray} from './add-gray.png';
export {default as attach} from './attach.png';
export {default as attachInactive} from './attach-inactive.png';
export {default as back} from './back.png';
export {default as link} from './link.png';
export {default as next} from './next.png';
export {default as search} from './search.png';
export {default as tag} from './tag.png';
export {default as visible} from './visible.png';
export {default as comment} from './comment.png';
export {default as share} from './permalink.png';
export {default as reply} from './reply.png';
export {default as closeOpaque} from './close-opaque.png';
export {default as arrowRightGray} from './arrow-right-gray.png';
export {default as arrowDownGray} from './arrow-down-gray.png';
export {default as zoomIn} from './zoom-in.png';
export {default as zoomOut} from './zoom-out.png';
export {default as logOut} from './logout.png';
export {default as checkWhite} from './check-white.png';
export {default as clearSearch} from './clear-search.png';
export {default as pencil} from './pencil.png';
export {default as pencilInactive} from './pencil-inactive.png';
export {default as star} from './star-active.png';
export {default as starInactive} from './star-inactive.png';
export {default as vote} from './vote-active.png';
export {default as voteInactive} from './vote-inactive.png';
export {default as trash} from './trash.png';
export {default as lockInactive} from './lock-inactive.png';
export {default as visibilitySmall} from './visibility-small.png';
export {default as visibility} from './visibility-action.png';
export {default as visibilityActive} from './visibility-action-active.png';
export {default as qrCode} from './qr-code.png';
export {default as history} from './history.png';
export {default as work} from './work.png';


type Props = {
  name?: string,
  size?: number,
  color?: string
};

class DefaultIconMaterial extends PureComponent<Props, void> {
  static defaultProps: Props = {
    name: '',
    size: 26,
    color: COLOR_PINK
  };

  render() {
    if (this.props.name) {
      return <IconMaterial name={this.props.name} size={this.props.size} color={this.props.color}/>;
    }
    return null;
  }
}


export const IconCheck = (props?: Props) => <DefaultIconMaterial {...Object.assign({
  name: 'check',
  size: 26,
  color: COLOR_ICON_GREY
}, props)} />;

export const IconClose = (props?: Props) => <DefaultIconMaterial {...Object.assign({
  name: 'close',
  size: 28,
  color: COLOR_PINK
}, props)} />;

export const IconMagnify = (props?: Props) => <DefaultIconMaterial {...Object.assign({
  name: 'magnify',
  size: 22,
  color: COLOR_PLACEHOLDER
}, props)} />;
