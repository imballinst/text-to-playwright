import { readFile } from 'fs/promises';
import path from 'path';
import { chromium, Page } from 'playwright';
import { parseArgs } from 'util';
import { InputStructure, parseInputTestFile, Selector, Step } from './parser/input';
import { runTests } from './runner';

const args = parseArgs({ options: { selector: { type: 'string', default: 'label' } } });

async function runPlaywrightExample() {
  const fileContent = await readFile(path.join(process.cwd(), 'assets/test/index.html'), 'utf-8');
  const testFileContent = await readFile(path.join(process.cwd(), 'assets/test/test.yaml'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(fileContent);

  const onFinishTestCase = async (page: Page) => {
    await page.reload();
    await page.setContent(fileContent);
  };

  const parsedTestFile = parseInputTestFile(testFileContent);
  if (args.values.selector === 'data-qa-id') {
    const array: Array<{ name: string; modifier: (parsedTestFile: InputStructure) => InputStructure }> = [
      {
        name: 'root',
        modifier: (parsed) => {
          const cloned = structuredClone(parsed) as InputStructure;
          cloned.selector = Selector.parse(args.values.selector);
          return cloned;
        }
      },
      {
        name: 'test',
        modifier: (parsed) => {
          const cloned = structuredClone(parsed) as InputStructure;
          for (const test of cloned.tests) {
            test.selector = Selector.parse(args.values.selector);
          }
          return cloned;
        }
      }
    ];

    for (const item of array) {
      console.info(`----------------------------------------------------------------`);
      console.info(`➡ Testing with selector data-qa-id on the ${item.name} level...`);
      console.info(`----------------------------------------------------------------`);

      const effectiveTestFile = item.modifier(parsedTestFile);

      for (const test of effectiveTestFile.tests) {
        for (let i = 0; i < test.steps.length; i++) {
          replaceStepValue(test.steps, i, (command) =>
            command.replace(/"([\w\s]+)" (link|button|input|element)/g, (...matches) => {
              if (!matches) return '';

              const [, object, elementType] = matches;
              let id = object.toLowerCase().replace(/\s+/g, '-');

              if (object === 'Submit' && command.includes('"Teams"')) {
                // This is a "hack" so we don't have to re-do writing the tests.
                id += '-teams';
              }

              return `"${id}" ${elementType}`;
            })
          );
        }
      }

      await runTests(page, effectiveTestFile, { onFinishTestCase });
    }
  } else {
    await runTests(page, parsedTestFile, { onFinishTestCase });
  }

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();

// Helper functions.
function replaceStepValue(steps: Step[], i: number, cb: (value: string) => string) {
  const step = steps[i];
  if (typeof step === 'object') {
    step.command = cb(step.command);
    return;
  }

  steps[i] = cb(step);
}
