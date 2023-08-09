import {
  QueryAssistAst,
  QueryAssistLogicalExpression,
  QueryAssistTermExpression,
} from 'components/query-assist/query-parser_types';

interface PairTerm {
  name: string;
  values: {
    name: string;
    negative: boolean;
    noWrap?: boolean;
  }[];
}

interface SingleTerm {
  name: string;
  negative: boolean;
}

interface QueryParseResult {
  pairs: PairTerm[];
  singles: SingleTerm[];
  text: string;
  unsupportedComplexity: boolean;
}


class QueryParser {
  result: QueryParseResult;
  workingQuery: string;

  static getEmptyAst(): QueryAssistAst {
    return {
      expression: {
        $type: 'TermExpression',
        terms: [],
      },
    };
  }

  static convertToNonStructural(text: string): string {
    return text.trim().length > 0 ? `{${text}}` : '';
  }

  static wrap(text: string): string {
    return text.indexOf(' ') !== -1 ? `{${text}}` : text;
  }

  constructor(query: string, ast: QueryAssistAst | null) {
    this.workingQuery = query;
    this.result = {
      pairs: [],
      singles: [],
      text: '',
      unsupportedComplexity: false,
    };

    const textTempArray: string[] = [];

    const addValue = (
      pair: PairTerm, name: string, negative = false, noWrap = false
    ) => {
      const exisingValue = pair.values.find(
        ev => ev.name.toLowerCase() === name.toLowerCase()
      );

      if (exisingValue) {
        if (exisingValue.negative && !negative) {
          exisingValue.negative = false;
        }
        return;
      }

      pair.values.push({
        name,
        negative,
        noWrap,
      });
    };

    const walk = (expr?: QueryAssistTermExpression | QueryAssistLogicalExpression) => {
      if (!expr) {
        return;
      }

      if (expr.$type === 'TermExpression') {
        for (const term of expr.terms) {
          switch (term.$type) {
            case 'AloneValueSearchTerm':
              this.result.singles.push({
                name: term.value.name,
                negative: term.minus,
              });
              break;
            case 'CategorizedSearchTerm':
              let existing = this.result.pairs.find(p => p.name.toLowerCase() === term.field.name.toLowerCase());
              if (!existing) {
                existing = {
                  name: term.field.name,
                  values: [],
                };
                this.result.pairs.push(existing);
              }

              for (const termValue of term.values) {
                switch (termValue.$type) {
                  case 'AttributeSearchValue':
                    addValue(existing, termValue.value.name, termValue.minus);
                    break;
                  case 'RangeSearchValue':
                    addValue(existing, `${termValue.left.name} .. ${termValue.right.name}`, termValue.minus, true);
                    break;
                  default:
                }
              }
              break;
            case 'TextSearchTerm':
              textTempArray.push(term.text.trim());
              break;
            default:
          }
        }
      } else if (expr.$type === 'LogicExpression') {
        if (expr.operator === 'OR') {
          this.result.unsupportedComplexity = true;
        }
        walk(expr.left);
        walk(expr.right);
      }
    };

    walk(ast?.expression);
    this.result.text = textTempArray.join(' ');
  }

  compile() {
    const queryParts = [];

    const {singles, pairs, text} = this.result;

    for (const single of singles) {
      queryParts.push(`${single.negative ? '-' : '#'}${QueryParser.wrap(single.name)}`);
    }

    for (const pair of pairs) {
      const values = pair.values
        .map(v => `${v.negative ? '-' : ''}${v.noWrap ? v.name : QueryParser.wrap(v.name)}`)
        .join(', ');

      queryParts.push(
        `${pair.name}: ${values}`
      );
    }

    queryParts.push(QueryParser.convertToNonStructural(text));
    return queryParts.join(' ').trim();
  }

  getValue(key: string): string[] {
    if (key) {
      const pair = this.result.pairs
        .find(s => s.name.toLowerCase() === key.toLowerCase());

      if (pair) {
        return pair.values.filter(v => !v.negative).map(v => v.name);
      }
    }

    return [];
  }
}

export default QueryParser;

