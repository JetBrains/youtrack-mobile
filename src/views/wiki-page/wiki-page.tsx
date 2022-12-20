import React, {PureComponent} from 'react';
import {View, Text, ScrollView, Share} from 'react-native';
import Header from 'components/header/header';
import LongText from 'components/wiki/text-renderer';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import YoutrackWiki from 'components/wiki/youtrack-wiki';
import {getApi} from 'components/api/api__instance';
import {IconClose} from 'components/icon/icon';
import {IconShare} from 'components/icon/icon';
import {isAndroidPlatform, isIOSPlatform} from '../../util/util';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';
import styles from './wiki-page.styles';
import type {Attachment} from 'flow/CustomFields';
import type {Node} from 'react';
import type {Theme, UITheme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
const CATEGORY_NAME = 'WikiPage';
const isAndroid: boolean = isAndroidPlatform();
type Props = {
  wikiText?: string;
  plainText?: string;
  title?: string;
  style?: ViewStyleProp;
  onIssueIdTap: () => void;
  attachments?: Array<Attachment>;
};
type DefaultProps = {
  onIssueIdTap: () => void;
  title: string;
};
type State = {
  isPinned: boolean;
};
export default class WikiPage extends PureComponent<Props, State> {
  state: State = {
    isPinned: false,
  };
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

  onScroll: (nativeEvent: any) => void = (nativeEvent: Record<string, any>) => {
    this.setState({
      isPinned: nativeEvent.contentOffset.y >= UNIT,
    });
  };

  renderWiki(uiTheme: UITheme) {
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

  render(): null | Node {
    const {wikiText, plainText, style, title} = this.props;

    if (!wikiText && !plainText) {
      return null;
    }

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const ContentComponent: any = isAndroid ? Text : LongText;
          return (
            <View style={styles.container} testID="wikiPage">
              <Header
                showShadow={true}
                leftButton={<IconClose size={21} color={styles.link.color} />}
                onBack={this.onBack}
                rightButton={<IconShare size={21} color={styles.icon.color} />}
                onRightButtonClick={() => {
                  const text: string = wikiText || plainText || '';

                  if (isIOSPlatform()) {
                    Share.share({
                      url: text,
                    });
                  } else {
                    Share.share(
                      {
                        message: text,
                      },
                      {
                        dialogTitle: text.substr(0, 100),
                      },
                    );
                  }
                }}
              >
                <Text style={styles.headerTitle} selectable={true}>
                  {title}
                </Text>
              </Header>

              <ScrollView
                contentContainerStyle={!isAndroid && styles.container}
                fadingEdgeLength={70}
                scrollEventThrottle={50}
                onScroll={params => this.onScroll(params.nativeEvent)}
              >
                <ScrollView
                  horizontal={true}
                  fadingEdgeLength={70}
                  scrollEventThrottle={50}
                >
                  <View style={styles.content}>
                    {wikiText && this.renderWiki(theme.uiTheme)}
                    {Boolean(!wikiText && !!plainText) && (
                      <ContentComponent
                        selectable={true}
                        style={[styles.plainText, style]}
                      >
                        {plainText}
                      </ContentComponent>
                    )}
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