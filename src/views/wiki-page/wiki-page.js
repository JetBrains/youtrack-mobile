/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, ScrollView} from 'react-native';

import type {Attachment} from '../../flow/CustomFields';

import {getApi} from '../../components/api/api__instance';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import Wiki from '../../components/wiki/wiki';
import Router from '../../components/router/router';

import styles from './wiki-page.styles';

const CATEGORY_NAME = 'WikiPage';


type Props = {
  wikiText: string,
  title?: string,
  onIssueIdTap: () => any,
  attachments?: Array<Attachment>
};

type DefaultProps = {
  onIssueIdTap: () => any
};

export default class WikiPage extends PureComponent<Props, void> {

  static defaultProps: DefaultProps = {
    onIssueIdTap: () => {}
  };

  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
  }

  _onBack() {
    const prevRoute = Router.pop();
    if (!prevRoute) {
      Router.IssueList();
    }
  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Back</Text>}
        onBack={this._onBack}
      >
        <Text style={styles.headerTitle} selectable={true}>{this.props.title}</Text>
      </Header>
    );
  }

  render() {
    const {wikiText, attachments, onIssueIdTap} = this.props;

    if (!wikiText) {
      return null;
    }

    const auth = getApi().auth;
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
            <Wiki
              backendUrl={auth.config.backendUrl}
              attachments={attachments}
              imageHeaders={auth.getAuthorizationHeaders()}
              onIssueIdTap={onIssueIdTap}
              renderFullException={true}
            >
              {wikiText}
            </Wiki>
          </View>

        </ScrollView>
      </View>

    );
  }
}
