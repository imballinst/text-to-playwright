import nlp from 'compromise';
import { z } from 'zod';
import { ARIA_ALIAS_RECORD, AriaRole } from '../types/aria';
import { ASSERT_BEHAVIOR_ALIAS } from '../types/assertions';

const Command = z.object({
  action: z.union([z.literal('click'), z.literal('hover'), z.literal('fill'), z.literal('ensure'), z.literal('store'), z.literal('slide')]),
  object: z.string(),
  elementType: AriaRole,
  specifier: z.string().optional(),
  isNegativeAssertion: z.boolean().optional(),
  assertBehavior: z.union([z.literal('exact'), z.literal('contain'), z.literal('match')]).optional(),
  variableName: z.string().optional(),
  valueBehavior: z.union([z.literal('accessible'), z.literal('visible')]).optional(),
  value: z.string().optional()
});
interface Command extends z.infer<typeof Command> {}

interface PreparsedCommand extends Omit<Command, 'action' | 'assertBehavior' | 'elementType'> {
  action: string;
  elementType: string;
  assertBehavior?: string;
}

interface PartOfSpeech {
  type: 'Verb' | 'Noun';
  words: string[];
}

const REGEX_SENTENCE_SEPARATOR = /[.,\n]/;

export function parseSentence(sentence: string) {
  const clauses: string[] = [];

  if (REGEX_SENTENCE_SEPARATOR.test(sentence)) {
    // Check if the comma is between quotes or not.
    let isWithinQuote = false;
    let effectiveSentence = '';

    for (let i = 0; i < sentence.length; i++) {
      const char = sentence[i];
      effectiveSentence += char;

      if (char === '"') {
        isWithinQuote = !isWithinQuote;
      } else if (REGEX_SENTENCE_SEPARATOR.test(char) && !isWithinQuote) {
        // Replace the comma with a dot, so that it's considered as a new sentence.
        // If it's a dot, well, same treatment.
        clauses.push(`${effectiveSentence.slice(0, -1)}.`);
        effectiveSentence = '';
      }
    }

    if (effectiveSentence) {
      clauses.push(effectiveSentence);
    }
  } else {
    clauses.push(sentence);
  }

  return clauses.map((clause) => {
    const lexicon = (nlp(clause).quotations().out('array') as string[]).map(removeQuotes).reduce(
      (obj, cur) => {
        obj[cur] = 'Noun';
        return obj;
      },
      {} as Record<string, string>
    );

    const doc = nlp(clause, {
      hover: 'Verb',
      click: 'Verb',
      link: 'Noun',
      ...lexicon
    }).out('json');

    const parts = doc.slice(1);
    for (const part of parts) {
      doc[0].text += ` ${part.text}`;
      doc[0].terms.push(...part.terms);
    }

    return doc[0];
  });
}

export function parse(sentence: string) {
  const result = parseSentence(sentence);
  const output: Command[] = [];

  for (const clause of result) {
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
        const lastIndex = prev.words.length - 1;

        if (prev.words[lastIndex].endsWith('-') && clause.terms[i - 1].tags.includes('Hyphenated')) {
          // We don't want to split texts by hyphens, especially if it's wrapped inside quote.
          prev.words[lastIndex] += text;
        } else {
          prev.words.push(text);
        }

        if (endsWithQuote) {
          prev = undefined;
        }

        continue;
      }

      if (isWithinQuote || (prev?.type === 'Noun' && prev.words[0] === 'to')) {
        term.chunk = 'Noun';
      }

      if (term.chunk === 'Pivot' && ['with', 'on', 'to', 'into'].includes(text)) {
        term.chunk = 'Noun';
        prev = undefined;
      } else if (!isWithinQuote && term.chunk === 'Noun' && term.tags.includes('Negative')) {
        term.chunk = 'Negative';
        prev = undefined;
      }

      if (!['Verb', 'Noun', 'Negative'].includes(term.chunk)) continue;

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
    const order = Object.keys(record) as Array<keyof PreparsedCommand>;
    let idx = 0;

    for (const rawCommand of cur) {
      switch (rawCommand.words[0]) {
        case 'not': {
          record.isNegativeAssertion = true;
          break;
        }
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
          record.value = extractQuotationValue(valueWords);

          break;
        }
        case 'into':
        case 'to': {
          // There is a special case to slider, because it's moving something from/to.
          const parsedAction = Command.shape.action.safeParse(record.action);
          if (parsedAction.success && parsedAction.data === 'slide') {
            const valueWords = rawCommand.words.slice(2).join(' ');
            record.value = extractQuotationValue(valueWords);

            break;
          }

          const [assertBehavior, ...rest] = rawCommand.words.slice(1);
          const valueCriteria = rest.slice(0, 2).join(' ');
          let valueWords = '';

          if (valueCriteria === 'accessible description') {
            // Accessible elements.
            valueWords = rest.slice(2).join(' ');
            record.valueBehavior = 'accessible';
          } else {
            // Normal value.
            valueWords = rest.slice(1).join(' ');
          }

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
            record.value = extractQuotationValue(valueWords);
          }

          break;
        }
        default: {
          const key = order[idx];

          if (key === 'action') {
            record.action = rawCommand.words.join(' ').toLowerCase();
          } else if (key === 'object') {
            const joined = rawCommand.words.join(' ');

            if (record.action === 'store') {
              record.object = joined.slice(joined.indexOf('"') + 1, joined.lastIndexOf('"'));
            } else {
              record.object = removeQuotes(joined);
            }
          } else if (key === 'elementType') {
            let effectiveObject = removePunctuations(rawCommand.words.join(' '));
            effectiveObject = ARIA_ALIAS_RECORD[effectiveObject] ?? effectiveObject;

            record.elementType = effectiveObject;
          }
        }
      }

      idx++;
    }

    output.push(Command.parse(record));
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

function extractQuotationValue(value: string) {
  return value.slice(value.indexOf('"') + 1, value.lastIndexOf('"'));
}
