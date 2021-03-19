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
import {IconClose} from '../../components/icon/icon';

import {ThemeContext} from '../../components/theme/theme-context';

import {UNIT} from '../../components/variables/variables';
import {elevation1} from '../../components/common-styles/shadow';
import styles from './wiki-page.styles';

import type {Theme, UITheme} from '../../flow/Theme';

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

type State = {
  isPinned: boolean
};

export default class WikiPage extends PureComponent<Props, State> {
  state = {
    isPinned: false,
  }

  static defaultProps: DefaultProps = {
    onIssueIdTap: () => {},
    title: '',
  };

  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
  }

  onBack() {
    const prevRoute = Router.pop(true);
    if (!prevRoute) {
      Router.navigateToDefaultRoute();
    }
  }

  onScroll = (nativeEvent: Object) => {
    this.setState({isPinned: nativeEvent.contentOffset.y >= UNIT});
  };

  _renderHeader(uiTheme: UITheme) {
    return (
      <Header
        style={this.state.isPinned ? elevation1 : null}
        leftButton={<IconClose size={21} color={uiTheme.colors.$link}/>}
        onBack={this.onBack}
      >
        <Text style={styles.headerTitle} selectable={true}>{this.props.title}</Text>
      </Header>
    );
  }

  _renderWiki(uiTheme: UITheme) {
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
        uiTheme={uiTheme}
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
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View
              testID="wikiPage"
              style={styles.container}
            >

              {this._renderHeader(theme.uiTheme)}

              <ScrollView
                scrollEventThrottle={100}
                onScroll={(params) => this.onScroll(params.nativeEvent)}
                style={styles.scrollContent}
              >
                <ScrollView
                  horizontal={true}
                  scrollEventThrottle={100}
                  contentContainerStyle={styles.scrollContent}
                >
                  <View style={styles.wiki}>
                    {wikiText && this._renderWiki(theme.uiTheme)}
                    {Boolean(!wikiText && plainText) && this._renderPlainText()}
                  </View>

                </ScrollView>
              </ScrollView>
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
