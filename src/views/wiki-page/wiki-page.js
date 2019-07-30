/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';

import type {Attachment} from '../../flow/CustomFields';

import {getApi} from '../../components/api/api__instance';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import Wiki from '../../components/wiki/wiki';
import Router from '../../components/router/router';

import styles from './wiki-page.styles';

import {COLOR_PINK} from '../../components/variables/variables';

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

const DEFAULT_TITLE: string = 'Wiki';


export default class WikiPage extends PureComponent<Props, void> {

  static defaultProps: DefaultProps = {
    onIssueIdTap: () => {
    },
    title: DEFAULT_TITLE
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

  _renderBackButton() {
    return <TouchableOpacity onPress={this._onBack}>
      <Text style={{color: COLOR_PINK}}>Back</Text>
    </TouchableOpacity>;
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
    const auth = getApi().auth;

    return (
      <View
        testID="wikiPage"
        style={styles.container}
      >
        {this._renderHeader()}

        {!wikiText && <View>
          <Text>Nothing to show.</Text>
          {this._renderBackButton()}
        </View>}

        {wikiText && <ScrollView
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

        </ScrollView>}
      </View>

    );
  }
}
