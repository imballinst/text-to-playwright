import nlp from 'compromise';
import { AriaRoles } from './types/aria';

interface Command {
  // TODO: need an action to fill inputs.
  action: 'click';
  object: string;
  elementType: AriaRoles;
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

    return nlp(clause, { ...lexicon, click: 'Verb' }).out('json');
  });

  const output: Command[] = [];

  for (const clauses of result) {
    for (const clause of clauses) {
      const cur: PartOfSpeech[] = [];
      let prev: PartOfSpeech | undefined;

      for (const term of clause.terms) {
        if (!['Verb', 'Noun'].includes(term.chunk)) continue;

        const text = (term.pre + term.text + term.post).trim();
        const endsWithQuote = text.endsWith('"');

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

      const [action, object, elementType] = cur;

      output.push({
        action: action.words.join(' ').toLowerCase(),
        object: object.words.join(' ').replace(/"/g, ''),
        elementType: elementType.words.join(' ').replace(/[\.,]/g, '')
        // TODO: validate with zod.
      } as Command);
    }
  }

  return output;
}
