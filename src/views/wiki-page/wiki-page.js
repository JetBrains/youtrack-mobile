/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, ScrollView} from 'react-native';

import Header from 'components/header/header';
import LongText from 'components/wiki/text-renderer';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import YoutrackWiki from 'components/wiki/youtrack-wiki';
import {getApi} from 'components/api/api__instance';
import {IconClose} from 'components/icon/icon';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';

import styles from './wiki-page.styles';

import type {Attachment} from 'flow/CustomFields';
import type {Node} from 'React';
import type {Theme, UITheme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

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
  state: State = {
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

  onScroll: ((nativeEvent: any) => void) = (nativeEvent: Object) => {
    this.setState({isPinned: nativeEvent.contentOffset.y >= UNIT});
  };

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

  render(): null | Node {
    const {wikiText, plainText} = this.props;

    if (!wikiText && !plainText) {
      return null;
    }

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <SafeAreaView style={[styles.container, {backgroundColor: theme.uiTheme.colors.$background}]}>
              <View
                testID="wikiPage"
                style={styles.container}
              >

                <Header
                  showShadow={true}
                  leftButton={<IconClose size={21} color={theme.uiTheme.colors.$link}/>}
                  onBack={this.onBack}
                >
                  <Text style={styles.headerTitle} selectable={true}>{this.props.title}</Text>
                </Header>

                <ScrollView
                  scrollEventThrottle={100}
                  onScroll={(params) => this.onScroll(params.nativeEvent)}
                  contentContainerStyle={styles.container}
                >
                  <ScrollView
                    horizontal={true}
                    scrollEventThrottle={100}
                    style={styles.container}
                  >
                    <View style={styles.wiki}>
                      {wikiText && this._renderWiki(theme.uiTheme)}
                      {Boolean(!wikiText && plainText) && this._renderPlainText()}
                    </View>

                  </ScrollView>
                </ScrollView>
              </View>
            </SafeAreaView>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
