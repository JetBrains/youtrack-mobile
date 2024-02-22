import React from 'react';

import {render, screen} from '@testing-library/react-native';

import ColorField, {ColorCoding} from '../color-field/color-field';

import styles from './color-field.styles';

const colorBackgroundMock = '#000';
const colorForegroundMock = '#FFF';
const textMock = 'Test custom field';


describe('<ColorField/>', () => {
  describe('Render text', () => {
    it('should render if `text` prop is not provided', () => {
      doRender({});

      expect(screen.getByTestId('test:id/color-field-value')).toBeTruthy();
    });

    it('should render first letter of color field', () => {
      doRender({text: textMock});

      expect(screen.findByText(textMock[0])).toBeTruthy();
    });

    it('should render whole text of color field', () => {
      doRender({text: textMock, fullText: true});

      expect(screen.getByText(textMock)).toBeTruthy();
    });
  });

  describe('Colorize', () => {
    beforeEach(() => {
      doRender({
        text: textMock,
        color: {
          id: '1',
          foreground: colorForegroundMock,
          background: colorBackgroundMock,
        },
      });

    });

    it('should set a background color', () => {
      expect(screen.getByTestId('test:id/color-field-value-wrapper')).toHaveProp('style', [
        {backgroundColor: colorBackgroundMock},
        styles.wrapper,
        styles.wrapperOneChar,
        null,
        null,
      ]);
    });

    it('should set a foreground color', () => {
      expect(screen.getByText(textMock[0])).toHaveProp('style', [
        styles.text,
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
        {color: colorForegroundMock},
      ]);
    });
  });

  function doRender({
    text,
    color,
    fullText,
    style,
  }: {
    text?: string;
    color?: ColorCoding;
    fullText?: boolean;
    style?: Record<string, string | number>
  }) {
    return render(<ColorField text={text} color={color} fullText={fullText} style={style}/>);
  }

});

