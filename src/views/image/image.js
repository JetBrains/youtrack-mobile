/* @flow */

import React, {PureComponent} from 'react';
import {View, ActivityIndicator} from 'react-native';

import {SvgFromUri} from 'react-native-svg';
import Gallery from 'react-native-image-gallery';
import ImageProgress from 'react-native-image-progress';

import once from 'lodash.once';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import {IconClose} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';
import {hasMimeType} from '../../components/mime-type/mime-type';

import {ThemeContext} from '../../components/theme/theme-context';

import styles from './image.styles';

import type {Attachment} from '../../flow/CustomFields';
import type {Theme} from '../../flow/Theme';

type Props = {
  imageAttachments: Array<Attachment>,
  current: Attachment,
  imageHeaders: ?Object,
  onRemoveImage?: (currentPage: number) => any
}

type State = {
  currentPage: number
}

export class Image extends PureComponent<Props, State> {
  closeView = once(function closeView() {
    return Router.pop(true);
  });

  componentDidMount() {
    const currentPage = this.getCurrentPage(this.props.current);
    this.setState({currentPage});
  }

  renderImage = (imageProps: Object) => {
    const source = imageProps.source;
    const attach = source && this.props.imageAttachments[this.getCurrentPage(source)];

    if (hasMimeType.svg(attach)) {
      return <SvgFromUri
        width="100%"
        height="100%"
        uri={attach.url}
      />;
    }

    return (
      <ImageProgress
        renderIndicator={() => <ActivityIndicator color={styles.loader.color} style={styles.loader} size="large"/>}
        onError={error => notify('Failed to load image')}
        {...imageProps}
      />
    );
  };

  getCurrentPage(current: Attachment) {
    return this.props.imageAttachments.findIndex(attach => attach.id === current.id);
  }

  onPageSelected = (currentPage: number) => this.setState({currentPage});

  render() {
    const currentIndex = this.getCurrentPage(this.props.current);
    const createSource = attach => ({
      source: {
        id: attach.id,
        uri: attach.url,
        headers: this.props.imageHeaders,
        mimeType: attach.mimeType,
      },
    });

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => (
          <View style={styles.container}>
            <Header
              leftButton={<IconClose size={21} color={theme.uiTheme.colors.$link}/>}
              onBack={this.closeView}
            />

            <Gallery
              style={styles.container}
              images={this.props.imageAttachments.map(createSource)}
              initialPage={currentIndex}
              imageComponent={this.renderImage}
              onPageSelected={this.onPageSelected}
            />

          </View>
        )}
      </ThemeContext.Consumer>
    );
  }
}

export default Image;
