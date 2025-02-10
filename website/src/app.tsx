import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { runTests } from '@text-to-test/core';
import { Moon, Sun } from 'lucide-react';
import { chromium } from 'playwright';
import { useLayoutEffect, useState } from 'preact/hooks';
import './app.css';

const DEFAULT_TEST_CASE = `
tests:
  - name: Example test case
    steps:
      - Click "Teams" link, then click "Submit" button.
      - Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".
      - Click "Submit" button on the Real Users Section.
      - Ensure "Real output" element on the Real Users Section to have value "123".
`.trim();

interface GroupedTest {
  name: string;
  steps: string[];
}

export function App() {
  const [tests, setTests] = useState<GroupedTest[]>([]);
  const { theme, setTheme } = useTheme();

  useLayoutEffect(() => {
    async function run() {
      setTests(await processInput(DEFAULT_TEST_CASE));
    }

    run();
  }, []);

  return (
    <>
      <nav className="px-6 py-2 border-b border-b-border flex justify-between">
        <ul className="flex items-center">
          <li>text-to-playwright</li>
        </ul>

        <div>
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

      <main className="bg-background h-full grid grid-cols-2 xs:grid-cols-1 gap-8 px-6 py-4">
        <section className="flex flex-col">
          <h2 className="font-bold mb-4">Input</h2>

          <div className="flex flex-col flex-1">
            <Label htmlFor="test-file" className="sr-only">
              Test file content
            </Label>

            <Textarea
              id="test-file"
              className="flex flex-1 resize-none"
              placeholder="Input your test file content here..."
              defaultValue={DEFAULT_TEST_CASE}
              onInput={async (e) => {
                try {
                  setTests(await processInput(e.currentTarget.value));
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        </section>

        <section className="flex flex-col">
          <h2 className="font-bold mb-4">Output</h2>

          <ol className="flex flex-col gap-y-2">
            {tests.map((test, idx) => (
              <li key={`${test.name}-${idx}`}>
                <article className="flex flex-col gap-y-2">
                  <h3>{test.name}</h3>

                  <pre className="border border-border flex-1 rounded-md text-sm p-2 whitespace-pre-wrap">{test.steps.join('\n')}</pre>
                </article>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}

async function processInput(input: string) {
  const output: string[] = [];
  const logger = (msg: string) => {
    output.push(msg);
  };

  const page = chromium.launch().newPage(logger);
  await runTests(page, input, logger);

  const groupedTests: Array<{ name: string; steps: string[] }> = [];
  let prev: (typeof groupedTests)[number] | undefined;

  for (const line of output) {
    if (line.startsWith('    ') && prev) {
      prev.steps.push(line.trim());
      continue;
    }

    if (line.startsWith('  ')) {
      prev = { name: line.trim(), steps: [] };
      groupedTests.push(prev);
      continue;
    }
  }

  return groupedTests;
}
