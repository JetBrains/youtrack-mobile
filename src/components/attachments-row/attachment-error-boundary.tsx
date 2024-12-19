import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';

import log from 'components/log/log';

import styles from './attachments-row.styles';

interface Props extends React.PropsWithChildren {
  attachName: string;
}

export default class AttachmentErrorBoundary extends PureComponent<Props, {hasError: boolean;}> {
  state = {hasError: false};

  componentDidCatch(error: Error) {
    this.setState({hasError: true});
    log.warn('Could not render attach', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View testID="attachmentErrorBoundaryPlaceholder" style={[styles.attachmentImage, styles.attachmentFile]}>
          <Text>{this.props.attachName}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
