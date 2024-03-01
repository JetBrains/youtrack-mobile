import React from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';
// @ts-ignore
import IconFA from 'react-native-vector-icons/FontAwesome';
// @ts-ignore
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

import ArrowLeft from '@jetbrains/icons/arrow-20px-left.svg';
import Attachment from '@jetbrains/icons/attachment-20px.svg';
import Checkmark from 'components/icon/assets/checkmark.svg';
import ChevronLeft from 'components/icon/assets/shevron_left.svg';
import ChevronSmallDown from 'components/icon/assets/shevron_small_down.svg';
import ChevronSmallUp from 'components/icon/assets/shevron_small_up.svg';
import Comment from 'components/icon/assets/comment.svg';
import Drag from '@jetbrains/icons/drag-20px.svg';
import History from 'components/icon/assets/history.svg';
import Link from '@jetbrains/icons/link-20px.svg';
import Lock from 'components/icon/assets/lock.svg';
import More from 'components/icon/assets/more.svg';
import Plus from 'components/icon/assets/plus.svg';
import Tag from '@jetbrains/icons/tag-20px.svg';
import Time from 'components/icon/assets/time.svg';
import Vcs from 'components/icon/assets/vcs.svg';
import Vote from 'components/icon/assets/vote.svg';
import IconYTM from './youtrack-icon';
import {isAndroidPlatform} from 'util/util';

import {TextStyleProp} from 'types/Internal';

// @ts-ignore
export {default as logo} from './youtrack-logo-512.png';

import styles, {rotate45} from './icon.styles';

type IconStyle = TextStyleProp | TextStyleProp[];

interface Props {
  name?: string;
  size?: number;
  color?: string;
  isFontAwesome?: boolean;
  style?: IconStyle;
  testID?: string;
}

const isAndroid = isAndroidPlatform();

const svgProps = () => ({
  size: 24,
  color: EStyleSheet.value('$link'),
});

const defaultProps = () => ({
  ...svgProps(),
  name: '',
  size: 26,
  isFontAwesome: false,
});

export function IconFont(props: Props): React.JSX.Element | null {
  if (!props.name) {
    return null;
  }

  const Icon = props.isFontAwesome ? IconFA : IconMaterial;
  return <Icon {...{...defaultProps(), ...props}} />;
}

export const IconAccountAlert = (props: Props) => (
  <IconFont
    {...{
      name: 'account-alert',
      ...props,
    }}
  />
);

const mergeStyles = (style: IconStyle = [], extraStyle: IconStyle = []): IconStyle[] => {
  return new Array<IconStyle>().concat(style).concat(extraStyle);
};

export const IconArrowUp = (props: Props) => (
  <IconFont
    {...{
      name: 'arrow-up',
      ...props,
    }}
  />
);

export const IconShare = (props: Props) => (
  <IconFont
    {...{
      name: 'export-variant',
      ...props,
    }}
  />
);

export const IconCircle = (props: Props) => (
  <IconFont
    {...{
      name: 'circle',
      ...props,
    }}
  />
);

export const IconCircleOutline = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-circle-outline',
      ...props,
    }}
  />
);

export const IconFileText = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'file-text-o',
      ...props,
    }}
  />
);

export const IconAngleRight = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'angle-right',
      ...props,
    }}
  />
);

export const IconCamera = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'camera',
      ...props,
    }}
  />
);

export const IconCheckboxBlank = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-outline',
      ...props,
    }}
  />
);

export const IconCheckboxChecked = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-marked',
      ...props,
    }}
  />
);

export const IconFileCheck = (props: Props) => (
  <IconFont
    {...{
      name: 'file-check-outline',
      ...props,
    }}
  />
);

export const IconClone = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'clone',
      ...props,
    }}
  />
);

export const IconAngleDownRight = (props: Props & {isDown?: boolean}) => (
  <IconYTM
    {...{
      ...defaultProps(),
      name: props?.isDown ? 'chevron-down' : 'chevron-right',
      ...props,
    }}
  />
);

export const IconPencil = (props: Props) => <IconYTM {...{...defaultProps(), name: 'pencil', ...props}} />;

export const IconRemoveFilled = (props: Props) => <IconYTM {...{...defaultProps(), name: 'remove-filled', ...props}} />;

export const IconWork = (props: Props) => <IconYTM {...{...defaultProps(), name: 'hourglass-20px', ...props}} />;

export const IconException = (props: Props) => <IconYTM {...{...defaultProps(), name: 'exception', ...props}} />;

/*
  SVG icons
 */

const createSVGProps = (
  props: Props,
  defaultSize: number,
  style?: IconStyle
): {
  [key: string]: string | number | IconStyle[];
} => {
  const color = props?.color || svgProps().color;
  const size = props?.size || defaultSize;
  return {color, width: size, height: size, style: mergeStyles(props?.style, style)};
};

export const IconLock = (props: Props) => <Lock {...createSVGProps(props, 16)} />;

export const IconAdd = (props: Props, style: IconStyle) => <Plus {...createSVGProps(props, 27, style)} />;

export const IconAngleDown = (props: Props) => <ChevronSmallDown {...createSVGProps(props, 18)} />;

export const IconAngleUp = (props: Props) => <ChevronSmallUp {...createSVGProps(props, 18)} />;

export const IconChevronDownUp = (props: Props & {isDown?: boolean}) => {
  return props?.isDown ? IconAngleDown(props) : IconAngleUp(props);
};

export const IconBack = (props: Props) =>
  isAndroid ? <ArrowLeft {...createSVGProps(props, 25)} /> : <ChevronLeft {...createSVGProps(props, 25)} />;

export const IconCheck = (props: Props) => <Checkmark {...createSVGProps(props, 25)} />;

export const IconClose = (props: Props) => IconAdd(props, rotate45);

export const IconComment = (props: Props) => <Comment {...createSVGProps(props, 24)} />;

export const IconHistory = (props: Props) => <History {...createSVGProps(props, 24)} />;

export const IconHourGlass = (props: Props) => <Time {...createSVGProps(props, 24)} />;

export const IconMoreOptions = (props: Props) =>
  <More {...createSVGProps(props, isAndroid ? 20 : 19, isAndroid ? styles.iconMoreOptionsAndroid : [])} />;

export const EllipsisVertical = (props: Props) => <Drag {...createSVGProps(props, 18)} />;

export const IconVcs = (props: Props) => <Vcs {...createSVGProps(props, 24)} />;

export const IconVote = (props: Props) => <Vote {...createSVGProps(props, 19)} />;

export const IconLink = (props: Props) => <Link {...createSVGProps(props, 20)} />;

export const IconTag = (props: Props) => <Tag {...createSVGProps(props, 20)} />;

export const IconAttachment = (props: Props) => <Attachment {...createSVGProps(props, 21)} />;

export const menuIconHelpdesk: string = `<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><g clip-path='url(#clip0_3843_29084)'><path fill-rule='evenodd' clip-rule='evenodd' d='M6.54225 5.48317C9.68729 2.84525 14.3057 2.84282 17.4562 5.48235L15.3221 7.61648C13.3633 6.13017 10.635 6.1305 8.67656 7.61748L6.54225 5.48317ZM18.5175 17.4585C21.1674 14.3094 21.1657 9.69249 18.5177 6.54221L16.3836 8.67635C17.8744 10.6351 17.8742 13.3655 16.3832 15.3241L18.5175 17.4585ZM5.48163 6.54387L7.61543 8.67767C6.12597 10.6359 6.12609 13.3647 7.61579 15.3228L5.48178 17.4568C2.83992 14.3102 2.84336 9.6898 5.48163 6.54387ZM6.543 18.5169C9.69041 21.1543 14.3044 21.155 17.4555 18.5177L15.3216 16.3839C13.363 17.8697 10.6353 17.8694 8.67704 16.3829L6.543 18.5169ZM19.0734 4.93118C15.168 1.02835 8.83048 1.02988 4.93005 4.92777C1.02963 8.82566 1.02127 15.1659 4.92664 19.0687C8.83201 22.9716 15.1695 22.97 19.0768 19.0653C22.984 15.1606 22.9787 8.83402 19.0734 4.93118ZM9.17065 9.17249C10.733 7.61118 13.267 7.61118 14.8293 9.17249C16.3917 10.7338 16.3917 13.2662 14.8293 14.8275C13.267 16.3888 10.733 16.3888 9.17065 14.8275C7.60833 13.2662 7.60833 10.7338 9.17065 9.17249Z' fill='currentColor'/></g><defs><clipPath id='clip0_3843_29084'><rect width='24' height='24' fill='white'/></clipPath></defs></svg>`;
export const menuIconIssues: string = `<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M14.7232 2.35704C9.3991 0.894807 3.89364 4.02918 2.43305 9.34727C0.972706 14.6645 4.10142 20.1804 9.4264 21.6429C14.7509 23.1053 20.2561 19.9703 21.7189 14.6441C22.2287 12.7878 22.1801 10.9084 21.674 9.18691C21.5572 8.78951 21.1403 8.56206 20.7429 8.67888C20.3455 8.7957 20.1181 9.21256 20.2349 9.60996C20.6646 11.0717 20.7064 12.6669 20.2725 14.2468C19.0288 18.7749 14.3487 21.4392 9.82366 20.1965C5.29909 18.9538 2.63811 14.2644 3.87949 9.74453C5.12061 5.22553 9.80044 2.56058 14.3259 3.80348C14.7253 3.91318 15.1381 3.67831 15.2478 3.27889C15.3575 2.87947 15.1226 2.46674 14.7232 2.35704ZM22.0069 3.85765C22.3402 3.61161 22.4108 3.14202 22.1648 2.8088C21.9188 2.47558 21.4492 2.4049 21.116 2.65094C16.6153 5.97403 13.6432 10.9489 12.1589 14.1022C11.4041 12.6535 10.3153 10.9074 8.94918 9.55413C8.65491 9.26262 8.18004 9.26486 7.88853 9.55913C7.59702 9.85341 7.59926 10.3283 7.89353 10.6198C9.58364 12.294 10.8523 14.715 11.5043 16.2041C11.6257 16.4813 11.9017 16.6584 12.2043 16.6532C12.5069 16.648 12.7766 16.4614 12.8884 16.1802C13.9582 13.4868 17.0106 7.54672 22.0069 3.85765Z' fill='currentColor'/></svg>`;
export const menuIconAgile: string = `<svg width='25' height='24' viewBox='0 0 25 24' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='8.7998' y='6.2688' width='4.5' height='11.4102' rx='2.25' transform='rotate(-90 8.7998 6.2688)' stroke='currentColor' stroke-width='1.5'/><rect x='3.78516' y='21.2627' width='4.5' height='17.4229' rx='2.25' transform='rotate(-90 3.78516 21.2627)' stroke='currentColor' stroke-width='1.5'/><rect x='1.84082' y='13.7656' width='4.5' height='13.5' rx='2.25' transform='rotate(-90 1.84082 13.7656)' stroke='currentColor' stroke-width='1.5'/></svg>`;
export const menuIconKB: string = `<svg width='25' height='24' viewBox='0 0 25 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M3.63015 3.12236C5.99481 2.98536 8.28244 3.36499 9.99782 4.64684C10.1736 4.7782 10.3431 4.91885 10.5056 5.06908C10.8097 5.35025 10.8284 5.82476 10.5472 6.12892C10.266 6.43308 9.7915 6.45171 9.48734 6.17054C9.36387 6.05639 9.23466 5.94909 9.09992 5.84841C7.78265 4.86405 5.90504 4.49308 3.71691 4.61984C3.63067 4.62484 3.53201 4.70358 3.53201 4.84177L3.53198 16.0211C4.48286 16.0109 6.0038 16.0381 7.56935 16.4285C8.83635 16.7445 10.1774 17.3098 11.2725 18.3209V10.9057L11.2727 10.8969C11.3427 7.9221 12.3832 5.85166 14.1247 4.5901C15.8313 3.35389 18.0854 2.98737 20.4153 3.12236C21.3463 3.1763 22.0134 3.96127 22.0134 4.84177L22.0134 16.2823C22.0134 16.9727 21.4521 17.5368 20.7518 17.5247C19.8496 17.509 18.3418 17.5058 16.8184 17.8891C15.2967 18.2721 13.8426 19.0191 12.9386 20.4438C12.8056 20.6536 12.536 20.921 12.0986 20.921C12.0857 20.921 12.0728 20.9207 12.0601 20.9201C12.0478 20.9207 12.0354 20.921 12.0229 20.921C11.6254 20.921 11.279 20.7095 11.0817 20.4047C10.1723 18.9993 8.72163 18.2618 7.20641 17.884C5.68989 17.5058 4.1916 17.5091 3.2936 17.5247C2.59328 17.5368 2.03198 16.9727 2.03198 16.2823L2.03201 4.84177C2.03201 3.96118 2.69932 3.17628 3.63015 3.12236ZM15.0047 5.80486C16.3187 4.85298 18.1735 4.49499 20.3286 4.61985C20.4147 4.62484 20.5134 4.7035 20.5134 4.84178L20.5134 16.0211C19.5578 16.0108 18.0263 16.0384 16.4523 16.4345C15.1922 16.7516 13.8608 17.3163 12.7725 18.3213V10.9235C12.8359 8.30912 13.727 6.73037 15.0047 5.80486ZM5.56533 7.72185C5.15207 7.69371 4.79425 8.00591 4.76611 8.41917C4.73797 8.83242 5.05017 9.19024 5.46343 9.21838C6.56872 9.29364 7.62715 9.57183 8.60227 10.0199C8.97866 10.1928 9.42397 10.0279 9.59692 9.65154C9.76986 9.27516 9.60494 8.82984 9.22856 8.65689C8.09269 8.13497 6.85695 7.8098 5.56533 7.72185ZM19.2578 8.41917C19.2297 8.00591 18.8719 7.69371 18.4586 7.72185C17.167 7.8098 15.9312 8.13497 14.7954 8.65689C14.419 8.82984 14.2541 9.27516 14.427 9.65154C14.6 10.0279 15.0453 10.1928 15.4217 10.0199C16.3968 9.57183 17.4552 9.29364 18.5605 9.21838C18.9738 9.19024 19.286 8.83242 19.2578 8.41917ZM18.4586 10.9842C18.8719 10.956 19.2297 11.2682 19.2578 11.6815C19.286 12.0948 18.9738 12.4526 18.5605 12.4807C17.4552 12.556 16.3968 12.8342 15.4217 13.2822C15.0453 13.4552 14.6 13.2902 14.427 12.9139C14.2541 12.5375 14.419 12.0922 14.7954 11.9192C15.9312 11.3973 17.167 11.0721 18.4586 10.9842Z' fill='currentColor'/></svg>`;
export const menuIconSettings: string = `<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.21298 9.27002L3.58085 11.4367C3.80013 11.784 3.80013 12.2158 3.58085 12.5632L2.21298 14.7299C2.03852 15.0062 1.99735 15.3413 2.12269 15.6402C2.513 16.5709 3.04853 17.433 3.70313 18.2021C3.91663 18.453 4.2465 18.587 4.58874 18.5835L7.27024 18.5559C7.70063 18.5515 8.09938 18.7674 8.31049 19.1192L9.62654 21.312C9.79473 21.5922 10.0842 21.7933 10.4233 21.8407C10.9378 21.9126 11.4642 21.9498 12 21.9498C12.5356 21.9498 13.062 21.9126 13.5764 21.8408C13.9156 21.7934 14.205 21.5922 14.3732 21.312L15.6893 19.1192C15.9004 18.7674 16.2991 18.5515 16.7295 18.5559L19.4112 18.5835C19.7534 18.587 20.0833 18.453 20.2968 18.2021C20.9514 17.4331 21.4869 16.571 21.8772 15.6404C22.0025 15.3415 21.9614 15.0064 21.7869 14.73L20.4189 12.5632C20.1996 12.2158 20.1996 11.784 20.4189 11.4367L21.7869 9.26985C21.9614 8.99349 22.0025 8.65834 21.8772 8.35947C21.4869 7.4289 20.9514 6.56682 20.2968 5.79776C20.0833 5.5469 19.7535 5.41289 19.4112 5.41641L16.7295 5.44396C16.2991 5.44838 15.9004 5.23248 15.6893 4.88073L14.3732 2.68788C14.205 2.40763 13.9156 2.2065 13.5764 2.15912C13.062 2.08728 12.5356 2.05005 12 2.05005C11.4642 2.05005 10.9378 2.08729 10.4233 2.15916C10.0842 2.20654 9.79473 2.40766 9.62654 2.68791L8.31049 4.88073C8.09938 5.23248 7.70063 5.44838 7.27024 5.44396L4.58874 5.41641C4.2465 5.41289 3.91663 5.5469 3.70312 5.79776C3.04853 6.56688 2.513 7.42903 2.12269 8.35967C1.99735 8.65853 2.03851 8.99368 2.21298 9.27002ZM10.8162 3.62065L9.59663 5.65263C9.09548 6.48765 8.18546 6.95344 7.25483 6.94388L4.72235 6.91786C4.27984 7.46197 3.90816 8.05516 3.61784 8.68546L4.84923 10.636C5.37733 11.4725 5.37733 12.5274 4.84923 13.3639L3.61784 15.3144C3.90816 15.9447 4.27984 16.5379 4.72236 17.082L7.25484 17.056C8.18546 17.0464 9.09548 17.5122 9.59663 18.3472L10.8162 20.3792C11.2031 20.4258 11.5982 20.4498 12 20.4498C12.4017 20.4498 12.7968 20.4258 13.1836 20.3793L14.4031 18.3473C14.9043 17.5122 15.8143 17.0464 16.7449 17.056L19.2776 17.082C19.7201 16.538 20.0917 15.9448 20.382 15.3146L19.1505 13.3639C18.6224 12.5274 18.6224 11.4725 19.1505 10.636L20.382 8.68528C20.0917 8.05505 19.7201 7.46192 19.2776 6.91786L16.7449 6.94388C15.8143 6.95344 14.9043 6.48765 14.4031 5.65263L13.1836 3.62063C12.7968 3.57411 12.4017 3.55005 12 3.55005C11.5982 3.55005 11.2031 3.57412 10.8162 3.62065Z' fill='currentColor'/><path fill-rule='evenodd' clip-rule='evenodd' d='M7.90112 12C7.90112 9.73624 9.73624 7.90112 12 7.90112C14.2637 7.90112 16.0988 9.73624 16.0988 12C16.0988 14.2637 14.2637 16.0988 12 16.0988C9.73624 16.0988 7.90112 14.2637 7.90112 12ZM12 9.40112C10.5647 9.40112 9.40112 10.5647 9.40112 12C9.40112 13.4353 10.5647 14.5988 12 14.5988C13.4353 14.5988 14.5988 13.4353 14.5988 12C14.5988 10.5647 13.4353 9.40112 12 9.40112Z' fill='currentColor'/></svg>`;
export const menuIconNotifications: string = `<svg width='25' height='24' viewBox='0 0 25 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M17.9302 0.928892C18.2035 0.617681 18.6774 0.58699 18.9886 0.860341C21.0125 2.63799 22.3339 5.18078 22.4429 8.05551C22.4586 8.46943 22.1358 8.8177 21.7219 8.83339C21.308 8.84908 20.9597 8.52626 20.944 8.11234C20.8516 5.67464 19.733 3.51061 17.9987 1.98733C17.6875 1.71398 17.6568 1.2401 17.9302 0.928892Z' fill='currentColor'/><path fill-rule='evenodd' clip-rule='evenodd' d='M6.11378 0.928892C5.84043 0.617681 5.36655 0.58699 5.05534 0.860341C3.03148 2.63799 1.71001 5.18078 1.60103 8.05551C1.58533 8.46943 1.90816 8.8177 2.32207 8.83339C2.73599 8.84908 3.08426 8.52626 3.09995 8.11234C3.19236 5.67464 4.31098 3.51061 6.04523 1.98733C6.35644 1.71398 6.38713 1.2401 6.11378 0.928892Z' fill='currentColor'/><path fill-rule='evenodd' clip-rule='evenodd' d='M6.41242 8.33355C6.41242 5.46454 8.84449 3.04272 11.9653 3.04272C15.0862 3.04272 17.5182 5.46454 17.5182 8.33355V9.42605C17.5182 10.465 17.7725 11.4881 18.2588 12.4061L19.7737 15.2658C20.3175 16.2923 19.5734 17.5287 18.4117 17.5287H5.57372C4.41941 17.5287 3.6747 16.3065 4.2039 15.2807L5.70398 12.3728C6.16951 11.4703 6.41242 10.4696 6.41242 9.45417V8.33355ZM4.91242 8.33355C4.91242 4.58308 8.07011 1.54272 11.9653 1.54272C15.8606 1.54272 19.0182 4.58308 19.0182 8.33355V9.42605C19.0182 10.2202 19.2126 11.0022 19.5843 11.704L21.0992 14.5636C22.1722 16.5892 20.7039 19.0287 18.4117 19.0287H10.0299C10.0645 20.0035 10.8408 20.8073 11.8349 20.8578C12.4554 20.8894 13.0214 20.6211 13.3929 20.1771C13.6587 19.8594 14.1317 19.8173 14.4494 20.0831C14.767 20.3489 14.8091 20.8219 14.5433 21.1396C13.8824 21.9294 12.8691 22.4124 11.7586 22.3559C9.96348 22.2646 8.56362 20.7984 8.52931 19.0287H5.57372C3.29606 19.0287 1.82662 16.6172 2.87082 14.593L4.37091 11.6851C4.72675 10.9953 4.91242 10.2304 4.91242 9.45417V8.33355Z' fill='currentColor'/></svg>`;
