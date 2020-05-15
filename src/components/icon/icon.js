import React, {PureComponent} from 'react';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome';

import {COLOR_PINK} from '../variables/variables';
import {isAndroidPlatform} from '../../util/util';

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
  color?: string,
  isFontAwesome?: boolean
};

const isAndroid = isAndroidPlatform();

class DefaultIcon extends PureComponent<Props, void> {
  static defaultProps: Props = {
    name: '',
    size: 26,
    color: COLOR_PINK,
    isFontAwesome: false
  };

  render() {
    if (!this.props.name) {
      return null;
    }
    const Icon = this.props.isFontAwesome ? IconFA : IconMaterial;
    return <Icon {...this.props}/>;
  }
}

/* Main menu icons */

export const IconBack = (props?: Props) => <DefaultIcon {...{
  name: isAndroid ? 'arrow-left' : 'chevron-left',
  size: isAndroid ? 22 : 36,
  ...props
}} />;

export const IconMenu = (props?: Props) => <DefaultIcon {...{
  name: 'menu',
  size: 24,
  ...props
}} />;


/* Material icons */

export const IconBell = (props?: Props) => <DefaultIcon {...{
  name: 'bell',
  ...props
}} />;

export const IconCheck = (props?: Props) => <DefaultIcon {...{
  name: 'check',
  ...props
}} />;

export const IconCheckMarked = (props?: Props) => <DefaultIcon {...{
  name: 'checkbox-marked-outline',
  ...props
}} />;

export const IconClose = (props?: Props) => <DefaultIcon {...{
  name: 'close',
  ...props
}} />;

export const IconMagnify = (props?: Props) => <DefaultIcon {...{
  name: 'magnify',
  ...props
}} />;

export const IconMagnifyZoom = (props?: Props & {zoomedIn?: boolean}) => <DefaultIcon {...{
  name: props.zoomedIn ? 'magnify-minus-outline' : 'magnify-plus-outline',
  ...props
}} />;

export const IconLogout = (props?: Props) => <DefaultIcon {...{
  name: 'logout',
  ...props
}} />;

export const IconLock = (props?: Props) => <DefaultIcon {...{
  name: 'lock',
  ...props
}} />;

export const IconArrowUp = (props?: Props) => <DefaultIcon {...{
  name: 'arrow-up',
  ...props
}} />;

export const IconPlus = (props?: Props) => <DefaultIcon {...{
  name: 'plus',
  ...props
}} />;

export const IconActions = (props?: Props) => <DefaultIcon {...{
  name: 'dots-horizontal',
  ...props
}} />;

export const IconStar = (props?: Props) => <DefaultIcon {...{
  name: 'star-outline',
  ...props
}} />;

export const IconThumbUp = (props?: Props & { isActive?: boolean }) => <DefaultIcon {...{
  name: props.isActive ? 'thumb-up' : 'thumb-up-outline',
  ...props
}} />;


/* FontAwesome icons */

export const IconAngleDown = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'angle-down',
  ...props
}} />;

export const IconAngleDownUp = (props?: Props & { isDown?: boolean }) => <DefaultIcon {...{
  isFontAwesome: true,
  name: props.isDown ? 'angle-down' : 'angle-up',
  ...props
}}/>;

export const IconAngleDownRight = (props?: Props & { isDown?: boolean }) => <DefaultIcon {...{
  isFontAwesome: true,
  name: props.isDown ? 'angle-down' : 'angle-right',
  ...props
}}/>;

export const IconAngleRight = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'angle-right',
  ...props
}} />;

export const IconCog = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'cog',
  ...props
}} />;

export const IconPaperClip = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'paperclip',
  ...props
}} />;

export const IconPause = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'pause',
  ...props
}} />;
