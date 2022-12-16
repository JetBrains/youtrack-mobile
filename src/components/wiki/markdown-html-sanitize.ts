/* @flow */

import {filterXSS, safeAttrValue} from 'xss';
import {getDefaultWhiteList} from 'cssfilter/lib/default';

const whiteListTags: string = 'a,b,bar,blockquote,br,caption,center,cite,code,col,colgroup,dd,details,div,dl,dt,em,font,h1,h2,h3,h4,h5,h6,kbd,i,img,li,ol,p,pre,q,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,tr,u,ul';
const tagsAttrsArray: string[] = ['style'];
const options = {
  allowCommentTag: false,
  onIgnoreTag: (tag, html, options) => {
    if (!whiteListTags.split(',').includes(tag)) {
      return '';
    }
    return '';
  },
  stripIgnoreTagBody: tagsAttrsArray,
  whiteList: whiteListTags.split(',').reduce(
    (map: { [string]: string[] }, tagName: string) => ({...map, [tagName]: tagsAttrsArray}), {}
  ),
  css: {whiteList: getDefaultWhiteList()},
  safeAttrValue: (
    tag: string,
    name: string,
    value: string,
    cssFilter,
  ) => {
    return safeAttrValue(tag, name, value, cssFilter);
  },
};

export function sanitizeRawHTML(raw: string): string {
  return filterXSS(raw, options);
}
