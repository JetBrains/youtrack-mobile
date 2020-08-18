/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, ScrollView} from 'react-native';

import type {Attachment} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import {getApi} from '../../components/api/api__instance';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import YoutrackWiki from '../../components/wiki/youtrack-wiki';
import Router from '../../components/router/router';
import LongText from '../../components/wiki/text-renderer';

import styles from './wiki-page.styles';
import {IconBack} from '../../components/icon/icon';

const CATEGORY_NAME = 'WikiPage';


type Props = {
  wikiText?: string,
  plainText?: string,
  title?: string,
  style?: ViewStyleProp,
  onIssueIdTap: () => void,
  attachments?: Array<Attachment>
};

type DefaultProps = {
  onIssueIdTap: () => void,
  title: string
};

export default class WikiPage extends PureComponent<Props, void> {

  static defaultProps: DefaultProps = {
    onIssueIdTap: () => {},
    title: ''
  };

  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
  }

  _onBack() {
    const prevRoute = Router.pop();
    if (!prevRoute) {
      Router.navigateToDefaultRoute();
    }
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<IconBack/>}
        onBack={this._onBack}
      >
        <Text style={styles.headerTitle} selectable={true}>{this.props.title}</Text>
      </Header>
    );
  }

  _renderWiki() {
    const {wikiText, attachments, onIssueIdTap} = this.props;
    const auth = getApi().auth;

    return (
      <YoutrackWiki
        style={styles.plainText}
        backendUrl={auth.config.backendUrl}
        attachments={attachments}
        imageHeaders={auth.getAuthorizationHeaders()}
        onIssueIdTap={onIssueIdTap}
        renderFullException={true}
      >
        {wikiText}
      </YoutrackWiki>
    );
  }

  _renderPlainText() {
    return <LongText style={[styles.plainText, this.props.style]}>{this.props.plainText}</LongText>;
  }

  render() {
    const {wikiText, plainText} = this.props;

    if (!wikiText && !plainText) {
      return null;
    }

    return (
      <View
        testID="wikiPage"
        style={styles.container}
      >
        {this._renderHeader()}

        <ScrollView
          scrollEventThrottle={100}
        >
          <View style={styles.wiki}>
            {wikiText && this._renderWiki()}
            {Boolean(!wikiText && plainText) && this._renderPlainText()}
          </View>

        </ScrollView>
      </View>

    );
  }
}
