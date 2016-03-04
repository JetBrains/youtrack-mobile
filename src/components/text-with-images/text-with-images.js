import React from 'react-native';
import {Text, Image, StyleSheet} from 'react-native';

const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;

class TextWithImages {
  /**
   * Hackish code to replace !ImageName.png! syntax with image nodes, and other text with text nodes
   * @param comment - issue comment
   * @param attachments - issue attachments field
   * @returns {View} - view of text and image nodes
   */
  static renderView(text, attachments) {
    let imageNames = text.match(ImageRegExp);
    if (!imageNames || !imageNames.length) {
      return <Text key={text}>{text}</Text>;
    }
    let textNodes = text.split(ImageRegExp);

    let resultView = [];
    (imageNames || []).forEach(function (imageName, index) {
      let attach = attachments.filter(a => `!${a.value}!` === imageName)[0];
      if (!attach) {
        return resultView.push(<Text key={index}>{textNodes[index]}</Text>);
      }

      resultView.push(<Text key={index}>{textNodes[index]}</Text>);
      resultView.push(<Image key={attach.id} style={styles.commentImage} source={{uri: attach.url}}/>);
    });

    const lastIndex = (imageNames || []).length;
    if (textNodes[lastIndex]) {
      resultView.push(<Text key={lastIndex}>{textNodes[lastIndex]}</Text>);
    }

    return resultView;
  }
}

const styles = StyleSheet.create({
  commentImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  }
});

module.exports = TextWithImages;
