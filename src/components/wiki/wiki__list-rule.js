import React from 'react';
import { Text } from 'react-native';
import SimpleMarkdown from 'simple-markdown';


/*eslint-disable prefer-template*/
const LIST_LOOKBEHIND_R = /^$|\n *$/;
// recognize a `*` `-`, `#`
const LIST_BULLET = '(?:[*#-]{1,3})';

// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
const LIST_R = new RegExp(
  `^( *)(${LIST_BULLET}) ` +
  '[\\s\\S]+?(?:\n{1,}(?! )' +
  '(?!\\1' + LIST_BULLET + ' )\\n*' +
  // the \\s*$ here is so that we can parse the inside of nested
  // lists, where our content might end before we receive two `\n`s
  '|\\s*\n*$)'
);
// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
const LIST_ITEM_PREFIX = `( *)(${LIST_BULLET}) +`;
const LIST_ITEM_PREFIX_R = new RegExp(`^${LIST_ITEM_PREFIX}`);
// recognize an individual list item:
//  * hi
//    this is part of the same item
//
//    as is this, which is a new paragraph in the same item
//
//  * but this is not part of the same item
const LIST_ITEM_R = new RegExp(
  LIST_ITEM_PREFIX +
  '[^\\n]*(?:\\n' +
  `(?!\\1${LIST_BULLET} )[^\\n]*)*(\n|$)`,
  'gm'
);
const BLOCK_END_R = /\n{2,}$/;
// recognize the end of a paragraph block inside a list item:
// two or more newlines at end end of the item
const LIST_BLOCK_END_R = BLOCK_END_R;
const LIST_ITEM_END_R = / *\n+$/;

const rule = {
  ...SimpleMarkdown.defaultRules.list,

  match: function (source, state, prevCapture) {

    // We only want to break into a list if we are at the start of a
    // line. This is to avoid parsing "hi * there" with "* there"
    // becoming a part of a list.
    // You might wonder, "but that's inline, so of course it wouldn't
    // start a list?". You would be correct! Except that some of our
    // lists can be inline, because they might be inside another list,
    // in which case we can parse with inline scope, but need to allow
    // nested lists inside this inline scope.
    const isStartOfLine = LIST_LOOKBEHIND_R.test(prevCapture);

    if (isStartOfLine) {
      return LIST_R.exec(source);
    } else {
      return null;
    }
  },

  parse: function (capture, parse, state) {
    const bullet = capture[2];

    const ordered = bullet === '#';

    const items = capture[0]
      .replace(LIST_BLOCK_END_R, '\n')
      .match(LIST_ITEM_R);

    const itemContent = items.map(function (item, i) {
      // Before processing the item, we need a couple things
      const content = item
        // remove the bullet:
        .replace(LIST_ITEM_PREFIX_R, '');

      // backup our state for restoration afterwards. We're going to
      // want to set state._list to true, and state.inline depending
      // on our list's looseness.
      const oldStateInline = state.inline;

      state.inline = true;
      state.bullet = item[0];

      const adjustedContent = content.replace(LIST_ITEM_END_R, '');
      const result = parse(adjustedContent, state);

      // Restore our state before returning
      state.inline = oldStateInline;

      return result;
    });

    return {
      ordered: ordered,
      items: itemContent
    };
  },

  react: function (node, output, state) {
    return (
      <Text key={state.key} testID="list-container">
        {node.items.map((item, i) => {
          const itemMark = node.ordered ? `${i + 1}. ` : '• ';

          return (
            <Text
              key={i}
              selectable={true}
              testID="list-item"
              >{itemMark}{output(item, state)}{'\n'}</Text>
          );
        })}
      </Text>
    );

  },
};

export default rule;
