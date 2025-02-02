import nlp from 'compromise';
import { z } from 'zod';
import { ARIA_ALIAS_RECORD, AriaRoles } from './types/aria';

const Command = z
  .object({
    action: z.union([
      z.literal('click'),
      z.literal('hover'),
      z.literal('fill')
    ]),
    object: z.string(),
    elementType: AriaRoles,
    specifier: z.string().optional(),
    value: z.string().optional()
  })
  .transform((v) => {
    for (const key in v) {
      if (v[key] === undefined) delete v[key];
    }
    return v;
  });
interface Command extends z.infer<typeof Command> {}

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

    return nlp(clause, {
      hover: 'Verb',
      click: 'Verb',
      link: 'Noun',
      ...lexicon
    }).out('json');
  });

  const output: Command[] = [];
  let conditionalInformationRecord = {
    value: '',
    elementContainer: ''
  };

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

        if (shouldJustPush && prev) {
          // If the text is still within quote, just push it.
          prev.words.push(text);

          if (endsWithQuote) {
            prev = undefined;
          }

          continue;
        }

        if (isWithinQuote) {
          term.chunk = 'Noun';
        }

        if (term.chunk === 'Pivot') {
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

      const record = {
        action: '',
        object: '',
        elementType: '',
        specifier: undefined as string | undefined,
        value: undefined as string | undefined
      };
      const order = Object.keys(record) as Array<keyof typeof record>;
      let idx = 0;

      for (const rawCommand of cur) {
        switch (rawCommand.words[0]) {
          case 'on': {
            let specifier = rawCommand.words.slice(2).join(' ');

            if (specifier[0] === specifier[0].toUpperCase()) {
              // Means a name. Do nothing.
            } else {
              // Means generic.
              if (['navbar', 'sidebar'].includes(specifier)) {
                specifier = 'nav';
              }
            }

            record.specifier = specifier;

            break;
          }
          case 'with': {
            const valueWords = rawCommand.words.slice(2).join(' ');
            record.value = valueWords.replace(/"/g, '');

            break;
          }
          default: {
            if (order[idx] === 'action') {
              record[order[idx]] = rawCommand.words.join(' ').toLowerCase();
            } else if (order[idx] === 'object') {
              record[order[idx]] = rawCommand.words.join(' ').replace(/"/g, '');
            } else {
              let effectiveObject = rawCommand.words.join(' ');
              effectiveObject =
                ARIA_ALIAS_RECORD[effectiveObject] ?? effectiveObject;

              record[order[idx]] = effectiveObject;
            }
          }
        }

        idx++;
      }

      output.push(Command.parse(record));
    }
  }

  return output;
}
