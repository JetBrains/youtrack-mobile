import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';

import Voice from '@react-native-voice/voice';
import IconUnmute from '@jetbrains/icons/unmute-20px.svg';

import log from 'components/log/log';

import styles from './voice.styles';

import type {SpeechRecognizedEvent, SpeechResultsEvent, SpeechErrorEvent} from '@react-native-voice/voice';

function VoiceTest({onRecognize}: {onRecognize: (text: string) => void}) {
  const txt = React.useRef<string>();

  function reset() {
    txt.current = '';
    setStarted(false);
    setPartialResults([]);
  }

  const [started, setStarted] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [partialResults, setPartialResults] = useState<string[]>([]);

  const onSpeechResults = async (e: SpeechResultsEvent) => {
    log.info('speech results ready ', e?.value || []);
    await Voice.destroy();
    Voice.removeAllListeners();
    setStarted(false);
  };

  useEffect(() => {
    reset();
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      reset();
      try {
        Voice.destroy().then(Voice.removeAllListeners);
      } catch (e) {
        log.warn(e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSpeechStart(e: any) {
    log.info('onSpeechStart: ', e);
  }

  function onSpeechRecognized(e: SpeechRecognizedEvent) {
    log.info('--------------------onSpeechRecognized: ', e);
  }

  function onSpeechEnd(e: any) {
    log.info('onSpeechEnd: ', e);
  }

  async function onSpeechError(e: SpeechErrorEvent) {
    log.warn('onSpeechError: ', e);
  }

  function onSpeechPartialResults(e: SpeechResultsEvent) {
    log.info('onSpeechPartialResults: ', e);
    const res = e.value && e.value?.length > 0 ? e.value : [];
    setPartialResults(res);
    txt.current = res.reduce((longest, current) => {
      return longest.length > current.length ? longest : current;
    }, '');
    onRecognize(txt.current);
    log.info('onSpeechPartialResults>>>>>: ', txt.current);
  }

  function onSpeechVolumeChanged(e: any) {
    // log.info('onSpeechVolumeChanged: ', e);
    // setVolume(e.value);
  }

  async function _startRecognizing() {
    log.info('started recognizing');
    try {
      const opts = {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
      };
      await Voice.start('en-US', opts);
    } catch (e) {
      log.warn(e);
    }
  }

  async function _stopRecognizing() {
    log.info('recognizing stopped');
    try {
      await Voice.stop();
    } catch (e) {
      log.warn(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function _cancelRecognizing() {
    log.info('canceling recognizing');
    try {
      await Voice.cancel();
      setStarted(false);
    } catch (e) {
      log.warn(e);
    }
  }

  return (
    <TouchableOpacity
      onPress={async () => {
        if (started) {
          setStarted(false);
          await _stopRecognizing();
        } else {
          reset();
          setStarted(true);
          await _startRecognizing();
        }
      }}
      style={[styles.button, started && styles.buttonActive]}
    >
      <IconUnmute color={styles.button.color} />
    </TouchableOpacity>
  );
}

export default React.memo(VoiceTest);

export let isRecordingAvailable = false;

async function start() {
  try {
    await Voice.isAvailable();
    isRecordingAvailable = true;
  } catch {}
}

start();
