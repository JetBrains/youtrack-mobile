import React from 'react';

import {render, screen} from '@testing-library/react-native';

import ColorField, {ColorCoding, NO_COLOR_CODING_ID} from '../color-field/color-field';

import styles from './color-field.styles';

const colorBackgroundMock = '#000';
const colorForegroundMock = '#FFF';
const textMock = 'Test custom field';


describe('<ColorField/>', () => {
  describe('Render text', () => {
    it('should render if `text` prop is not provided', () => {
      renderDefault();

      expect(screen.getByTestId('test:id/color-field-value')).toBeTruthy();
    });

    it('should not render if color coding is default', () => {
      doRender({color: {id: NO_COLOR_CODING_ID, foreground: '', background: ''}});

      expect(screen.queryByTestId('test:id/color-field-value')).toBeNull();
    });

    it('should render first letter of color field', () => {
      renderDefault(textMock);

      expect(screen.findByText(textMock[0])).toBeTruthy();
    });

    it('should render whole text of color field', () => {
      renderDefault(textMock, true);

      expect(screen.getByText(textMock)).toBeTruthy();
    });
  });

  describe('Colorize', () => {
    it('should set a background color', () => {
      renderDefault();
      expect(screen.getByTestId('test:id/color-field-value-wrapper')).toHaveProp('style', [
        {backgroundColor: colorBackgroundMock},
        styles.wrapper,
        styles.wrapperOneChar,
        null,
        null,
      ]);
    });

    it('should set a foreground color', () => {
      renderDefault();
      expect(screen.getByText(textMock[0])).toHaveProp('style', [
        styles.text,
        null,
        null,
        {color: colorForegroundMock},
      ]);
    });

    it('should fontSize from the style parameter', () => {
      doRender({
        text: textMock,
        color: {
          id: '1',
          foreground: colorForegroundMock,
          background: colorBackgroundMock,
        },
        style: {fontSize: 22},
      });

      expect(screen.getByText(textMock[0])).toHaveProp('style', [
        styles.text,
        {'fontSize': 22},
        null,
        {color: colorForegroundMock},
      ]);
    });

    it('should have monospace style', () => {
      doRender({
        text: textMock,
        color: {
          id: '1',
          foreground: colorForegroundMock,
          background: colorBackgroundMock,
        },
        monospace: true,
      });

      expect(screen.getByText(textMock[0])).toHaveProp('style', [
        styles.text,
        null,
        {'fontFamily': expect.any(String)},
        {color: colorForegroundMock},
      ]);
    });

  });

  function renderDefault(text?: string, fullText = false) {
    doRender({
      text: text || textMock,
      fullText,
      color: {
        id: '1',
        foreground: colorForegroundMock,
        background: colorBackgroundMock,
      },
    });
  }

  function doRender({
    text,
    color,
    fullText,
    style,
    monospace,
  }: {
    text?: string;
    color?: ColorCoding;
    fullText?: boolean;
    style?: Record<string, string | number>
    monospace?: boolean,
  }) {
    return render(<ColorField monospace={monospace} text={text} color={color} fullText={fullText} style={style}/>);
  }

});

