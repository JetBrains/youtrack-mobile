/* @flow */

import React from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';

import Details from '../details/details';
import MarkdownView from '../wiki/markdown-view';
import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange} from './activity__stream-helper';
import {getErrorMessages, getInfoMessages, getVcsPresentation, getProcessorsUrls} from './activity__stream-vcs-helper';
import {HIT_SLOP} from '../common-styles/button';
import {relativeDate} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';
import type {PullRequest, VCSActivity, VcsProcessor} from '../../flow/Vcs';

type Props = {
  activityGroup: Activity,
}

const StreamVCS = (props: Props) => {
  function renderMarkdown(markdown: ?string, hasStyle: boolean = false) {
    return (
      markdown
        ? (
          <View style={hasStyle && styles.activityWorkComment}>
            <MarkdownView>
              {markdown}
            </MarkdownView>
          </View>
        )
        : null
    );
  }

  function renderMessage(message: string, index: number, arr: Array<string>, isError: boolean = false) {
    return <View key={`message_${index}`}>
      <Text style={[styles.vcsMessage, isError && styles.vcsError]}>
        {message}
      </Text>
    </View>;
  }

  function renderError(message: string, index: number, arr: Array<string>) {
    return renderMessage(message, index, arr, true);
  }


  const vcs: VCSActivity | null = props.activityGroup.vcs?.pullRequest || firstActivityChange(props.activityGroup.vcs);

  if (!vcs) {
    return null;
  }

  const infoMessages: Array<string> = getInfoMessages(vcs);
  const errorMessages: Array<string> = getErrorMessages(vcs);
  const date: number = vcs.fetched || vcs.date;
  const processors: Array<VcsProcessor> = getProcessorsUrls(vcs);
  const title: string = props.activityGroup.merged ? '' : 'Committed changes' + ' ';
  const renderProcessorURL: (
    processor: VcsProcessor | PullRequest,
    singleUrl?: boolean
  ) => React$Element<typeof View> = (processor: VcsProcessor | PullRequest, singleProcessor?: boolean) => {
    return (
      <View
        key={processor.id}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => Linking.openURL(processor.url)}
        >
          <Text style={styles.link}>{singleProcessor ? getVcsPresentation(vcs) : (processor.label || '')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {!props.activityGroup.merged && props.activityGroup.author && (
        <StreamUserInfo activityGroup={{...props.activityGroup, timestamp: 0}}/>
      )}

      <View style={styles.activityChange}>
        <View style={styles.vcsInfo}>
          {!!date && (
            <Text style={[styles.vcsInfoDate, styles.secondaryTextColor]}>{title}{relativeDate(date)}</Text>
          )}

          {Boolean(vcs.version && processors) && (
            <View>
              {processors.length === 1 && renderProcessorURL(processors[0], true)}
              {processors.length > 1 && <Details
                toggler={getVcsPresentation(vcs)}
                renderer={() => <>{processors.map((processor: VcsProcessor) => renderProcessorURL(processor))}</>}
              />}
            </View>
          )}

          {!!vcs.url && <View>{renderProcessorURL(vcs, true)}</View>}
        </View>

        {renderMarkdown(vcs.title, !!vcs.id)}
        {renderMarkdown(vcs.text, !!vcs.id)}

        {(infoMessages.length > 0 || errorMessages.length > 0) && (
          <Details
            style={styles.secondaryTextColor}
            toggler="Show more"
            renderer={() => (
              <>
                {infoMessages.length > 0 && infoMessages.map(renderMessage)}
                {errorMessages.length > 0 && errorMessages.map(renderError)}
              </>
            )}
          />
        )}

        {!!vcs.files && vcs.files !== -1 && (
          <View style={styles.vcsFilesAmount}>
            <Text style={[styles.activityLabel]}>
              {vcs.files} {vcs.files > 1 ? 'files' : 'file'}
            </Text>
          </View>
        )}

      </View>
    </View>
  );
};

export default (React.memo<Props>(StreamVCS): React$AbstractComponent<Props, mixed>);
