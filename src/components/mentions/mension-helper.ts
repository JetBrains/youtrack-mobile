import type {User} from 'flow/User';

const getSuggestWord = (
  text: string,
  caret: number,
): null | RegExp$matchResult | string => {
  const match = /[\S@]+$/.exec(text.slice(0, caret));
  return match && match[0];
};

const composeSuggestionText = (
  user: User,
  text: string = '',
  caret: number,
): void | string => {
  const word: string | null | undefined = getSuggestWord(text, caret);

  if (word) {
    const startIndex: number = text.slice(0, caret).lastIndexOf(word);
    const login: string = (user.login as any) as string;
    const newText: string = replaceRange(
      text,
      startIndex,
      startIndex + word.length,
      `@${login}`,
    );
    return newText;
  }
};

function replaceRange(
  source: string,
  start: number,
  end: number,
  substitute: string,
) {
  return source.substring(0, start) + substitute + source.substring(end);
}

export {composeSuggestionText, getSuggestWord};