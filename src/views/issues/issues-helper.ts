import {Animated, Easing} from 'react-native';

import {getApi} from 'components/api/api__instance';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {until} from 'util/util';
import {whiteSpacesRegex} from 'components/wiki/util/patterns';

import type API from 'components/api/api';
import type {FilterField, IssueFieldSortProperty, SearchSuggestions} from 'types/Sorting';
import type {FilterSetting} from 'views/issues/index';
import type {Folder} from 'types/User';


const doAssist = async (params: {
  context: Folder | null | undefined;
  query: string;
  sortProperties?: IssueFieldSortProperty[];
}): Promise<SearchSuggestions> => {
  const api: API = getApi();
  const {context, query = '', sortProperties} = params;
  const [error, searchSuggestions] = await until(
    api.search.getSearchSuggestions({
      folder: context?.id ? context : undefined,
      query,
      sortProperties,
    }),
  );
  return error ? ({} as any) : searchSuggestions;
};

const getSortPropertyName = (sortProperty: IssueFieldSortProperty): string => {
  const sortField = sortProperty.sortField;
  let name = '';
  if (sortField) {
    if ('sortablePresentation' in sortField) {
      name = sortField.sortablePresentation;
    } else {
      name = getLocalizedName(sortField);
    }
  }
  return name && sortField?.$type === 'PredefinedFilterField'
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : name;
};

const isRelevanceSortProperty = (sortProperty: IssueFieldSortProperty): boolean => {
  return sortProperty.$type === 'RelevanceSortProperty';
};

const convertToNonStructural = (text: string): string => text.trim() ? `{${text.replace(whiteSpacesRegex, ' ')}}` : text;

const wrapToBraces = (text: string): string => {
  const str: string = text.trim();
  if (str && whiteSpacesRegex.test(str)) {
    return convertToNonStructural(str);
  }
  return str;
};

const createQueryFromFiltersSetting = (filters: FilterSetting[] = []): string => {
  const groupedQuery = filters.reduce((akk: {[key: string]: string}, it: FilterSetting) => {
    const query: string = (it.selectedValues || []).map(wrapToBraces).join(',');

    if (query) {
      akk[getFilterFieldName(it.filterField[0])] = query;
    }
    return akk;
  }, {});

  const {project, ...other} = groupedQuery;
  const q: string[] = project ? [`project:${project}`] : [];
  for(const v in other) {
    q.push(`${v}:${other[v]}`);
  }
  return q.join(' ').trim();
};

const getFilterFieldName = (filterField: FilterField) => {
  const key: string = filterField?.customField?.name || filterField?.name || '';
  return key.toLowerCase();
};

const createAnimatedRotateStyle = (): {transform: {rotate: Animated.AnimatedInterpolation<string>}[]} => {
  const rotateAnimation = new Animated.Value(0);
  Animated.timing(rotateAnimation, {
    toValue: 1,
    duration: 1500,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start(() => rotateAnimation.setValue(0));
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    transform: [
      {
        rotate: interpolateRotating,
      },
    ],
  };
};


export {
  createQueryFromFiltersSetting,
  createAnimatedRotateStyle,
  convertToNonStructural,
  doAssist,
  getFilterFieldName,
  getSortPropertyName,
  isRelevanceSortProperty,
  wrapToBraces,
};
