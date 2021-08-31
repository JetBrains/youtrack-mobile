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
import type {VcsChange, VcsProcessor} from '../../flow/Vcs';

type Props = {
  activityGroup: Activity,
}

const StreamVCS = (props: Props) => {
  const vcs: VcsChange | null = firstActivityChange(props.activityGroup.vcs);

  if (!vcs) {
    return null;
  }

  const infoMessages: Array<string> = getInfoMessages(vcs);
  const errorMessages: Array<string> = getErrorMessages(vcs);
  const date: number = vcs.fetched || vcs.date;
  const renderProcessorURL: (
    processor: VcsProcessor,
    singleUrl?: boolean
  ) => React$Element<typeof View> = (processor: VcsProcessor, singleProcessor?: boolean) => {
    return (
      <View
        key={processor.id}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => Linking.openURL(processor.url)}
        >
          <Text style={styles.link}>{singleProcessor ? getVcsPresentation(vcs) : processor.label}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const processors: Array<VcsProcessor> = getProcessorsUrls(vcs);
  const title: string = props.activityGroup.merged ? '' : 'Committed changes' + ' ';

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

          {!!vcs.version && <View>
            {processors.length === 1 && renderProcessorURL(processors[0], true)}
            {processors.length > 1 && (
              <Details
                toggler={getVcsPresentation(vcs)}
                renderer={() => <>{processors.map((processor: VcsProcessor) => renderProcessorURL(processor))}</>}
              />
            )}
          </View>}
        </View>

        {!!vcs.text && (
          <View style={vcs.id && styles.activityWorkComment}>
            <MarkdownView>
              {vcs.text}
            </MarkdownView>
          </View>
        )}

        {(infoMessages.length || errorMessages.length) && (
          <Details
            style={styles.secondaryTextColor}
            toggler="Show more"
            renderer={() => (
              <>
                {infoMessages.length > 0 && infoMessages.map((msg: string, index: number) => (
                  <View key={`infoMessage_${index}`}>
                    <Text style={styles.vcsMessage}>
                      {msg}
                    </Text>
                  </View>
                ))}
                {errorMessages.length > 0 && errorMessages.map((msg: string, index: number) => (
                  <View key={`errorMessage_${index}`}>
                    <Text style={styles.vcsError}>{msg}</Text>
                  </View>
                ))}
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
