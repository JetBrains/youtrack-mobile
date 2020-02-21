/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, ScrollView, TextInput} from 'react-native';

import entities from 'entities';

import type {Attachment} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import {getApi} from '../../components/api/api__instance';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import Wiki from '../../components/wiki/wiki';
import Router from '../../components/router/router';

import styles from './wiki-page.styles';
import BackIcon from '../../components/menu/back-icon';

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
  MAX_PLAIN_TEXT_LENGTH: number = 5000;

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
        leftButton={<BackIcon/>}
        onBack={this._onBack}
      >
        <Text style={styles.headerTitle} selectable={true}>{this.props.title}</Text>
      </Header>
    );
  }

  _renderWiki() {
    const {wikiText, attachments, onIssueIdTap} = this.props;
    const auth = getApi().auth;

    return <Wiki
      backendUrl={auth.config.backendUrl}
      attachments={attachments}
      imageHeaders={auth.getAuthorizationHeaders()}
      onIssueIdTap={onIssueIdTap}
      renderFullException={true}
    >
      {wikiText}
    </Wiki>;
  }

  _renderPlainText() {
    const decodedText:string = entities.decodeHTML(this.props.plainText) || '';

    if (decodedText.length > this.MAX_PLAIN_TEXT_LENGTH) {
      return <TextInput
        style={[styles.plainText, this.props.style]}
        editable={false}
        multiline={true}
        value={decodedText}
      />;
    }
    return <Text style={[styles.plainText, this.props.style]}>{decodedText}</Text>;
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
