import nlp from 'compromise';
import { AriaRoles } from './types/aria';

interface Command {
  action: 'click';
  object: string;
  elementType: AriaRoles;
  value?: string;
}

interface PartOfSpeech {
  type: 'Verb' | 'Noun';
  words: string[];
}

export function parse(sentence: string) {
  const doc = nlp(sentence);
  const clauses: string[] = doc.clauses().out('array');
  // print(clauses);
  const result = clauses.map((clause) => {
    const lexicon = nlp(clause)
      .quotations()
      .out('array')
      .map((el) => (el.endsWith('"') ? el.slice(1, -1) : el.slice(0, -1)))
      .reduce((obj, cur) => {
        obj[cur] = 'Noun';
        return obj;
      }, {});

    return nlp(clause, { click: 'Verb', link: 'Noun', ...lexicon }).out('json');
  });

  const output: Command[] = [];

  for (const clauses of result) {
    for (const clause of clauses) {
      const cur: PartOfSpeech[] = [];
      let prev: PartOfSpeech | undefined;
      let isWithinQuote = false;

      for (let i = 0; i < clause.terms.length; i++) {
        const term = clause.terms[i];
        const text = (term.pre + term.text + term.post).trim();

        const endsWithQuote = text.endsWith('"');
        const shouldJustPush = isWithinQuote;

        isWithinQuote =
          (isWithinQuote || text.startsWith('"')) && !endsWithQuote;

        if (isWithinQuote) {
          term.chunk = 'Noun';
        }

        if (shouldJustPush && prev) {
          // If the text is still within quote, just push it.
          prev.words.push(text);

          if (endsWithQuote) {
            prev = undefined;
          }

          continue;
        }

        if (term.chunk === 'Pivot' && text === 'with') {
          prev = {
            type: 'Noun',
            words: [text]
          };
          cur.push(prev);
        }

        if (!['Verb', 'Noun'].includes(term.chunk)) continue;

        if (!prev || prev.type !== term.chunk) {
          prev = {
            type: term.chunk,
            words: [text]
          };
          cur.push(prev);
        } else {
          prev.words.push(text);
        }

        if (endsWithQuote) {
          prev = undefined;
        }
      }

      const [action, object, elementType, value] = cur;

      // TODO: validate with zod.
      const command = {
        action: action.words.join(' ').toLowerCase(),
        object: object.words.join(' ').replace(/"/g, ''),
        elementType: elementType.words.join(' ').replace(/[\.,]/g, '')
      } as Command;

      if (value) {
        const valueWords = value.words.join(' ');

        command.value = valueWords.slice(
          valueWords.indexOf('"') + 1,
          valueWords.lastIndexOf('"')
        );
      }

      output.push(command);
    }
  }

  return output;
}
