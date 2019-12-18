/* @flow */

type NodeType = {
  textOrNewLine?: boolean,
  expandCollapseToggle?: boolean,
  exceptionTitle?: boolean,
  exception?: boolean,
  checkbox?: boolean,
  code?: boolean,
  image?: boolean,
  p?: boolean,
  strong?: boolean,
  ul?: boolean,
  font?: boolean,
  del?: boolean,
  monospace?: boolean,
  quoteOrBlockquote?: boolean,
  table?: boolean,
  tr?: boolean,
  th?: boolean,
  td?: boolean
}

const isNodeHasSelector = (node: Object, tag: ?string, className: string): boolean => {
  if (node?.name !== tag) {
    return false;
  }

  const nodeClasses = node?.attribs?.class;
  const classes = nodeClasses && nodeClasses.split(' ');
  return !!classes && classes.some(it => it === className);
};

export function nodeHasType(node: Object = {}): NodeType {
  const types: NodeType = {};

  switch (true) {
  case (node.type === 'text' && node.data === '\n'):
    types.textOrNewLine = true;
    break;
  case (isNodeHasSelector(node, 'span', 'wiki-plus')):
    types.expandCollapseToggle = true;
    break;
  case (isNodeHasSelector(node, 'span', 'wiki-hellip')):
    types.exceptionTitle = true;
    break;
  case (isNodeHasSelector(node, 'pre', 'wiki-exception')):
    types.exception = true;
    break;
  case (node.name === 'input'):
    types.checkbox = true;
    break;
  case (isNodeHasSelector(node, 'pre', 'wikicode') || node?.name === 'code'):
    types.code = true;
    break;
  case (node.name === 'img'):
    types.image = true;
    break;
  case (node.name === 'p'):
    types.p = true;
    break;
  case (node.name === 'strong'):
    types.strong = true;
    break;
  case (isNodeHasSelector(node, 'ul', 'wiki-list1')):
    types.ul = true;
    break;
  case (node.name === 'font'):
    types.font = true;
    break;
  case (node.name === 'del'):
    types.del = true;
    break;
  case (isNodeHasSelector(node, 'span', 'monospace')):
    types.monospace = true;
    break;
  case (isNodeHasSelector(node, 'div', 'quote') || node.name === 'blockquote'):
    types.quoteOrBlockquote = true;
    break;
  case (node.name === 'table'):
    types.table = true;
    break;
  case (node.name === 'tr'):
    types.tr = true;
    break;
  case (node.name === 'th'):
    types.th = true;
    break;
  case (node.name === 'td'):
    types.td = true;
    break;
  }

  return types;
}



