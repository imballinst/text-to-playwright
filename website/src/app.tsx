import { GitHubIcon } from '@/components/icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { runTests } from '@text-to-test/core';
import debounce from 'lodash/debounce';
import { Moon, Sun } from 'lucide-react';
import { chromium, LoggerSingleton } from 'playwright';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createHighlighterCore, createJavaScriptRegexEngine, HighlighterCore } from 'shiki';
import yaml from 'yaml';
import { parseInputTestFile } from '../../src/parser/input';
import './app.css';

const DEFAULT_TEST_CASE = (import.meta.env.VITE_YAML_CONTENT ?? '').trim();

interface GroupedTest {
  name: string;
  steps: Array<{ name: string; codeArray: string[] }>;
}

let highlighter: HighlighterCore | undefined;
// Initialize the first time.
getShikiHighlighter();

export function App() {
  const [tests, setTests] = useState<GroupedTest[]>([]);
  const [selector, setSelector] = useState('default');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function run() {
      setTests(await processInput(DEFAULT_TEST_CASE));
    }

    run();

    return () => {
      getShikiHighlighter().then((highlighter) => highlighter.dispose());
    };
  }, []);

  const syncInputText = useCallback(
    debounce(async function sync(selector: string) {
      if (inputRef.current) {
        const inputTestFile = inputRef.current.value;
        const output = await getOutput(inputTestFile, selector);

        inputRef.current.value = output.testFile;
        setTests(output.groupedTests);
      }
    }, 1000),
    []
  );

  return (
    <>
      <nav className="px-6 py-2 border-b border-b-border flex justify-between items-center sticky top-0 bg-background/90">
        <div>text-to-playwright</div>

        <div className="flex items-center gap-x-2">
          <a href="https://github.com/imballinst/text-to-playwright" target="_blank" rel="noreferrer" aria-label="GitHub repository">
            <GitHubIcon className="w-4 fill-accent-foreground" />
          </a>

          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer border-0"
            onClick={() => {
              setTheme(theme === 'light' ? 'dark' : 'light');
            }}
          >
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />

            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>

      <main className="bg-background grid md:grid-cols-5 grid-cols-1 gap-8 px-6 py-4 flex-1">
        <section className="flex flex-col md:col-span-2">
          <h2 className="font-bold mb-4">Input</h2>

          <div className="flex flex-col flex-1">
            <Label htmlFor="test-file" className="sr-only">
              Test file content
            </Label>

            <RadioGroup
              className="flex mb-4"
              value={selector}
              onValueChange={async (value) => {
                setSelector(value);
                syncInputText(value);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="data-qa-id" id="data-qa-id" />
                <Label htmlFor="data-qa-id">Data QA ID</Label>
              </div>
            </RadioGroup>

            <Textarea
              id="test-file"
              className="flex flex-1 resize-none"
              placeholder="Input your test file content here..."
              defaultValue={DEFAULT_TEST_CASE}
              ref={inputRef}
              onInput={async () => {
                syncInputText(selector);
              }}
            />
          </div>
        </section>

        <section className="flex flex-col md:col-span-3">
          <h2 className="font-bold mb-4">Output</h2>

          <ol className="flex flex-col gap-y-4">
            {tests.map((test, idx) => (
              <li key={`${test.name}-${idx}`}>
                <article className="flex flex-col gap-y-2">
                  <h3>{test.name}</h3>

                  <ol className="flex flex-col gap-y-2 pl-4">
                    {test.steps.map((step, idx) => (
                      <li className="flex flex-col gap-y-2">
                        <h4 key={`${step.name}-${idx}`}>{step.name}</h4>

                        <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{
                            __html: step.codeArray[0]
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                </article>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}

async function processInput(input: string): Promise<GroupedTest[]> {
  const output: string[] = [];
  const logger = (msg: string) => {
    output.push(msg);
  };

  const page = chromium.launch().newPage();
  LoggerSingleton.setLogger(logger);

  const parsedTestFile = parseInputTestFile(input);
  await runTests(page, parsedTestFile);

  const groupedTests: Array<GroupedTest> = [];
  let prevGroup: GroupedTest | undefined;
  let prevTest: GroupedTest['steps'][number] | undefined;

  for (const line of output) {
    if (line.startsWith('    ') && prevTest) {
      prevTest.codeArray.push(line.trim());
      continue;
    }

    if (line.startsWith('  ') && prevGroup) {
      prevTest = { name: line.trim(), codeArray: [] };
      prevGroup.steps.push(prevTest);
      continue;
    }

    prevGroup = { name: line.trim(), steps: [] };
    groupedTests.push(prevGroup);
  }

  for (const groupedTest of groupedTests) {
    for (const step of groupedTest.steps) {
      const highlighter = await getShikiHighlighter();
      step.codeArray = [
        await highlighter.codeToHtml(step.codeArray.join('\n'), {
          lang: 'typescript',
          themes: {
            light: 'min-light',
            dark: 'nord'
          }
        })
      ];
    }
  }

  return groupedTests;
}

async function getShikiHighlighter() {
  if (highlighter) {
    return highlighter;
  }

  highlighter = await createHighlighterCore({
    themes: [import('@shikijs/themes/nord'), import('@shikijs/themes/min-light')],
    langs: [import('@shikijs/langs/typescript')],
    engine: createJavaScriptRegexEngine()
  });
  return highlighter;
}

async function getOutput(testFile: string, selector: string) {
  const parsed = parseInputTestFile(testFile);
  if (selector !== 'default') {
    parsed.selector = selector as typeof parsed.selector;
  } else {
    delete parsed.selector;
  }

  const stringified = yaml.stringify(parsed, {
    sortMapEntries: true
  });

  return { testFile: stringified, groupedTests: await processInput(stringified) };
}
