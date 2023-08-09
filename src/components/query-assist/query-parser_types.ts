export interface QueryAssistAstTextTerm {
  $type: 'TextSearchTerm';
  minus: boolean;
  start: number;
  stop: number;
  text: string;
}

export interface QueryAssistAstAloneTerm {
  $type: 'AloneValueSearchTerm';
  minus: boolean;
  start: number;
  stop: number;
  value: {
    $type: string;
    name: string;
  };
}

export interface QueryAssistAstAttributeSearchValue {
  $type: 'AttributeSearchValue';
  minus: boolean;
  start: number;
  stop: number;
  value: {
    $type: 'SearchValue';
    name: string;
  };
}

export interface QueryAssistAstRangeSearchValue {
  $type: 'RangeSearchValue';
  minus: boolean;
  start: number;
  stop: number;
  left: {
    $type: 'SearchValue';
    name: string;
  };
  right: {
    $type: 'SearchValue';
    name: string;
  };
}

type QueryAssistAstSearchItemValue = QueryAssistAstAttributeSearchValue | QueryAssistAstRangeSearchValue;

export interface QueryAssistAstCategorizedTerm {
  $type: 'CategorizedSearchTerm';
  field: {
    $type: string;
    name: string;
    start: number;
    stop: number;
    filterFields: {
      id: string | 'PredefinedFilterField';
      customField?: {
        name: string;
        id: string;
        $type: 'CustomField';
      };
      name: string;
      $type: 'SearchField' | 'CustomFilterField';
    }[];
  };
  values: QueryAssistAstSearchItemValue[];
}

export type QueryAssistAstTerm = QueryAssistAstAloneTerm | QueryAssistAstCategorizedTerm | QueryAssistAstTextTerm;

export interface QueryAssistTermExpression {
  $type: 'TermExpression';
  terms: QueryAssistAstTerm[];
}

export interface QueryAssistLogicalExpression {
  left?: QueryAssistTermExpression | QueryAssistLogicalExpression;
  right?: QueryAssistTermExpression | QueryAssistLogicalExpression;
  $type: 'LogicExpression';
  operator: 'OR' | 'AND';
}

export interface QueryAssistAst {
  expression: QueryAssistLogicalExpression | QueryAssistTermExpression;
}
