import React, {useState} from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';
import BottomSheetModal from '../modal-panel-bottom/bottom-sheet-modal';
import Details from '../details/details';
import MarkdownView from '../wiki/markdown-view';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange} from './activity__stream-helper';
import {
  getErrorMessages,
  getInfoMessages,
  getVcsPresentation,
  getProcessorsUrls,
  pullRequestState,
} from './activity__stream-vcs-helper';
import {HIT_SLOP} from '../common-styles/button';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {IconCaretDownUp} from '../icon/icon';

import styles from './activity__stream.styles';

import type {Activity} from 'types/Activity';
import type {PullRequest, VCSActivity, VcsProcessor} from 'types/Vcs';
import type {TextStyleProp} from 'types/Internal';

interface Props {
  activityGroup: Activity;
}

const StreamVCS = (props: Props) => {
  function renderMarkdown(
    markdown: string | null | undefined,
    hasStyle: boolean = false,
  ) {
    return markdown ? (
      <View style={hasStyle && styles.activityWorkComment}>
        <MarkdownView>{markdown}</MarkdownView>
      </View>
    ) : null;
  }

  function renderMessage(
    message: string,
    index: number,
    arr: string[],
    isError: boolean = false,
  ) {
    return (
      <View key={`message_${index}`}>
        <Text style={[styles.vcsMessage, isError && styles.vcsError]}>
          {message}
        </Text>
      </View>
    );
  }

  function renderError(message: string, index: number, arr: string[]) {
    return renderMessage(message, index, arr, true);
  }

  const [sourcesVisible, updateSourcesVisible] = useState(false);
  const pullRequest: PullRequest | null | undefined = props.activityGroup.vcs?.pullRequest;
  const firstChange: Record<string, any> | null = firstActivityChange(props.activityGroup.vcs);
  const vcs: VCSActivity | null = pullRequest || firstChange;

  if (!vcs) {
    return null;
  }

  const infoMessages: string[] = getInfoMessages(vcs).filter(Boolean);
  const errorMessages: string[] = getErrorMessages(vcs).filter(Boolean);
  const date: number = vcs.fetched || vcs.date;
  const processors: VcsProcessor[] = getProcessorsUrls(vcs);
  let title: string = props.activityGroup.merged
    ? ''
    : i18n('committed changes');

  if (pullRequest) {
    switch (firstChange?.state?.id) {
      case pullRequestState.OPEN: {
        const reopened = firstChange.reopened;
        title = reopened
          ? i18n('reopened the pull request')
          : i18n('submitted a pull request');
        break;
      }

      case pullRequestState.MERGED: {
        title = i18n('merged the pull request');
        break;
      }

      case pullRequestState.DECLINED: {
        title = i18n('closed the pull request');
      }
    }
  }

  const renderProcessorURL: (
    processor: VcsProcessor | PullRequest,
    singleUrl?: boolean,
    textStyle?: TextStyleProp,
  ) => React.ReactElement<
    React.ComponentProps<typeof TouchableOpacity>,
    typeof TouchableOpacity
  > = (
    processor: VcsProcessor | PullRequest,
    singleProcessor: boolean = false,
    textStyle?: TextStyleProp,
  ) => {
    return (
      <Text key={processor.id || processor?.label || processor?.idExternal}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => Linking.openURL(processor.url)}
        >
          <Text style={[styles.link, textStyle]}>
            {singleProcessor ? getVcsPresentation(vcs) : processor.label || ''}
          </Text>
        </TouchableOpacity>
      </Text>
    );
  };

  const renderSourcesDialog = () => {
    return (
      <BottomSheetModal
        isVisible={sourcesVisible}
        header={!!vcs.files && vcs.files !== -1 && (
          <View style={styles.vcsBottomSheetHeader}>
            <Text style={styles.activityLabel}>
              {i18nPlural(vcs.files, '{{amount}} file', '{{amount}} files', {
                amount: vcs.files,
              })}
            </Text>
          </View>
        )}
        onClose={() => updateSourcesVisible(false)}
      >
        {processors.map((processor: VcsProcessor) =>
          renderProcessorURL(processor, false, styles.vcsSourceButton),
        )}
      </BottomSheetModal>
    );
  };

  return (
    <View>
      {sourcesVisible && renderSourcesDialog()}

      {!props.activityGroup.merged && props.activityGroup.author && (
        <StreamUserInfo
          activityGroup={{...props.activityGroup, timestamp: 0}}
        />
      )}

      <View style={styles.activityChange}>
        <View style={styles.vcsInfo}>
          {!!date && (
            <Text style={[styles.vcsInfoDate, styles.secondaryTextColor]}>
              {title ? `${title} ` : ''}
              <StreamTimestamp
                style={props.activityGroup.merged && styles.activityTimestampMerged}
                timestamp={date}
              />
            </Text>
          )}

          {Boolean(vcs.version && processors) && (
            <View>
              {processors.length === 1 &&
                renderProcessorURL(processors[0], true)}
              {processors.length > 1 && (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  onPress={() => updateSourcesVisible(true)}
                >
                  <Text style={styles.link}>
                    <IconCaretDownUp
                      size={12}
                      isDown={!sourcesVisible}
                      style={styles.vcsSourceButtonIcon}
                      color={styles.vcsSourceButton.color}
                    />{' '}
                    {getVcsPresentation(vcs)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!!vcs.url && <View>{renderProcessorURL(vcs, true)}</View>}
        </View>

        {renderMarkdown(vcs.title, !!vcs.id)}
        {renderMarkdown(vcs.text, !!vcs.id)}

        {(infoMessages.length > 0 || errorMessages.length > 0) && (
          <Details
            style={{
              ...styles.showMoreMessage,
              ...(errorMessages.length
                ? styles.vcsError
                : styles.secondaryTextColor),
            }}
            toggler={i18n('Show more')}
            renderer={() => (
              <>
                {infoMessages.length > 0 && infoMessages.map(renderMessage)}
                {errorMessages.length > 0 && errorMessages.map(renderError)}
              </>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default React.memo<Props>(StreamVCS);
