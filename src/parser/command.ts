import nlp from 'compromise';
import { z } from 'zod';
import { ARIA_ALIAS_RECORD, AriaRole } from '../types/aria';
import { ASSERT_BEHAVIOR_ALIAS } from '../types/assertions';

const Command = z.object({
  action: z.union([z.literal('click'), z.literal('hover'), z.literal('fill'), z.literal('ensure'), z.literal('store')]),
  object: z.string(),
  elementType: AriaRole,
  specifier: z.string().optional(),
  assertBehavior: z.union([z.literal('exact'), z.literal('contain'), z.literal('match')]).optional(),
  variableName: z.string().optional(),
  value: z.string().optional()
});
interface Command extends z.infer<typeof Command> {}

interface PreparsedCommand {
  action: string;
  object: string;
  elementType: string;
  assertBehavior?: string;
  specifier?: string;
  variableName?: string;
  value?: string;
}

interface PartOfSpeech {
  type: 'Verb' | 'Noun';
  words: string[];
}

export function parseSentence(sentence: string) {
  let effectiveSentence = sentence;
  if (effectiveSentence.includes(',')) {
    // Check if the comma is between quotes or not.
    let isWithinQuote = false;

    for (let i = 0; i < effectiveSentence.length; i++) {
      const char = effectiveSentence[i];

      if (char === '"') {
        isWithinQuote = !isWithinQuote;
      } else if (char === ',' && !isWithinQuote) {
        // Replace the comma with a dot, so that it's considered as a new sentence.
        effectiveSentence = effectiveSentence.slice(0, i) + '.' + effectiveSentence.slice(i + 1);
      }
    }
  }

  const doc = nlp(effectiveSentence);
  const clauses = doc.document;

  return clauses.map((clause) => {
    const sentence = clause.map(({ pre, post, text }) => `${pre}${text}${post}`).join('');

    const lexicon = (nlp(sentence).quotations().out('array') as string[]).map(removeQuotes).reduce(
      (obj, cur) => {
        obj[cur] = 'Noun';
        return obj;
      },
      {} as Record<string, string>
    );

    return nlp(sentence, {
      hover: 'Verb',
      click: 'Verb',
      link: 'Noun',
      ...lexicon
    }).out('json');
  });
}

export function parse(sentence: string) {
  const result = parseSentence(sentence);
  const output: Command[] = [];

  for (const clauses of result) {
    for (const clause of clauses) {
      const cur: PartOfSpeech[] = [];
      let prev: PartOfSpeech | undefined;
      let isWithinQuote = false;

      for (let i = 0; i < clause.terms.length; i++) {
        const term = clause.terms[i];
        const post = term.post.endsWith('.') ? term.post.slice(0, -1) : term.post;
        const text = (term.pre + term.text + post).trim();

        const endsWithQuote = text.endsWith('"');
        const shouldJustPush = isWithinQuote;

        isWithinQuote = (isWithinQuote || text.startsWith('"')) && !endsWithQuote;

        if (shouldJustPush && prev) {
          // If the text is still within quote, just push it.
          prev.words.push(text);

          if (endsWithQuote) {
            prev = undefined;
          }

          continue;
        }

        if (isWithinQuote || (prev?.type === 'Noun' && prev.words[0] === 'to')) {
          term.chunk = 'Noun';
        }

        if (term.chunk === 'Pivot' && ['with', 'on', 'to', 'into'].includes(text)) {
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

      const record: PreparsedCommand = {
        action: '',
        object: '',
        elementType: ''
      };
      const order = Object.keys(record) as Array<keyof typeof record>;
      let idx = 0;

      for (const rawCommand of cur) {
        switch (rawCommand.words[0]) {
          case 'on': {
            let specifier = removePunctuations(rawCommand.words.slice(2).join(' '));

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
            record.value = removePunctuations(valueWords);

            break;
          }
          case 'into':
          case 'to': {
            const [assertBehavior, , ...rest] = rawCommand.words.slice(1);
            const valueWords = rest.join(' ');

            // If the elementType is not valid ARIA, default to generic.
            const parsedAriaRole = AriaRole.safeParse(record.elementType);
            if (!parsedAriaRole.success) {
              record.elementType = 'generic';
            }

            // Process either "store" or "ensure".
            if (record.action === 'store') {
              record.variableName = extractVariableName(rawCommand.words.at(-1)!);
              break;
            }

            record.assertBehavior = ASSERT_BEHAVIOR_ALIAS[assertBehavior] ?? assertBehavior;

            if (record.assertBehavior === 'match') {
              // Regex-based assertion. Intended to not use a RegEx replacer function, because we want to make sure
              // we don't accidentally trim the RegEx content.
              record.value = extractRegexPattern(valueWords);
            } else if (valueWords.startsWith('{') && valueWords.endsWith('}')) {
              // Compare with the previous stored value.
              record.variableName = extractVariableName(valueWords);
            } else {
              // Compare with literal value.
              record.value = removePunctuations(valueWords);
            }

            break;
          }
          default: {
            if (order[idx] === 'action') {
              record.action = rawCommand.words.join(' ').toLowerCase();
            } else if (order[idx] === 'object') {
              const joined = rawCommand.words.join(' ');

              if (record.action === 'store') {
                record.object = joined.slice(joined.indexOf('"') + 1, joined.lastIndexOf('"'));
              } else {
                record.object = removeQuotes(joined);
              }
            } else {
              let effectiveObject = removePunctuations(rawCommand.words.join(' '));
              effectiveObject = ARIA_ALIAS_RECORD[effectiveObject] ?? effectiveObject;

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

// Helper functions.
function removePunctuations(value: string) {
  return value.replace(/[.,"]/g, '');
}

function removeQuotes(value: string) {
  return value.replace(/"/g, '');
}

function extractVariableName(value: string) {
  return value.replace(/[{}.]/g, '');
}

function extractRegexPattern(value: string) {
  return value.slice(value.indexOf('/') + 1, value.lastIndexOf('/'));
}
