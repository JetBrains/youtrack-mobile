/* @flow */

/* https://github.com/google/diff-match-patch/wiki/Line-or-Word-Diffs */

import DiffMatchPatch from 'diff-match-patch';

class DiffMatchWord {
  dmp: DiffMatchPatch;
  diffPatchType = {
    DIFF_INSERT: DiffMatchPatch.DIFF_INSERT,
    DIFF_DELETE: DiffMatchPatch.DIFF_DELETE,
    DIFF_EQUAL: DiffMatchPatch.DIFF_EQUAL
  };


  constructor() {
    this.dmp = new DiffMatchPatch();
  }

  diff(text1: string, text2: string) {
    return this.diffWordMode(text1, text2);
  }

  diffWordMode(text1: string, text2: string) {
    const a = this.diffWordsToChars(text1, text2);
    const lineText1 = a.chars1;
    const lineText2 = a.chars2;
    const lineArray = a.lineArray;
    const diffs = this.dmp.diff_main(lineText1, lineText2, false);
    // diff_charsToLines function works fine in word-mode
    this.dmp.diff_charsToLines_(diffs, lineArray);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }

  boundaryIndex(str: string, regExp: RegExp, fromIndex: number) {
    let index = fromIndex;
    while (index < str.length) {
      if (regExp.test(str[index])) {
        return index;
      }
      index++;
    }
    return -1;
  }

  encodeWordsToChars(text: string, wordArray: Array<string>, wordHash: Object) {
    let chars = '';
    let wordStart = 0;
    let wordEnd = 0;
    let wordArrayLength = wordArray.length;
    const textEnd = text.length;
    const wb = /\B/;
    const hasOwnProperty = Object.hasOwnProperty;

    while (wordEnd < textEnd) {
      wordEnd = (wb.test(text[wordStart]) ? // Treat word breaks as separate words
        Math.min(wordEnd + 1, textEnd) :
        this.boundaryIndex(text, wb, wordStart));

      if (wordEnd === -1) {
        wordEnd = textEnd;
      }

      const word = text.substring(wordStart, wordEnd);
      wordStart = wordEnd;

      if (!hasOwnProperty.call(wordHash, word)) {
        wordHash[word] = wordArrayLength;
        wordArray[wordArrayLength++] = word;
      }

      chars += String.fromCharCode(wordHash[word]);
    }

    return chars;
  }

  diffWordsToChars(text1: string, text2: string) {
    // Split two texts into an array of strings. Reduce the texts to a string of
    // hashes where each Unicode character represents one word
    // @see https://github.com/google/diff-match-patch/wiki/Line-or-Word-Diffs
    const wordArray = [];
    const wordHash = {};

    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    wordArray[0] = '';

    const chars1 = this.encodeWordsToChars(text1, wordArray, wordHash);
    const chars2 = this.encodeWordsToChars(text2, wordArray, wordHash);
    return {
      chars1: chars1,
      chars2: chars2,
      lineArray: wordArray
    };
  }

}

export default new DiffMatchWord();
