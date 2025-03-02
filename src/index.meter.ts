import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { SliderLocator } from './locators/slider';

async function runPlaywrightExample() {
  const testFileContent = await readFile(path.join(process.cwd(), 'website/src/examples/meter/test.yaml'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // await page.goto('http://localhost:4173/meter/');
  await page.goto('http://localhost:5173/meter/');
  // await page.goto('https://imballinst.github.io/text-to-playwright/meter/');

  // const parsedTestFile = parseInputTestFile(testFileContent);
  // await runTests(page, parsedTestFile);

  console.info('ye');

  const slider = new SliderLocator(page, {
    kind: 'role',
    name: 'Crit chance slider native',
    role: 'slider'
    // thumb: {
    //   locator: 'span[data-slot=slider-thumb]',
    //   valueAttribute: 'aria-valuenow'
    // }
  });
  // const slider = new SliderLocator(page, {
  //   kind: 'label',
  //   label: 'Crit chance slider shadcn',
  //   thumb: {
  //     locator: 'span[data-slot=slider-thumb]',
  //     valueAttribute: 'aria-valuenow'
  //   }
  // });
  await slider.initSliderAttributes();

  // This is a debugger. There is some kind of pattern to this, but it's pretty hard to model (or maybe I'm just skill issue).
  // const map: Record<number, number> = {};

  // for (let i = 0; i <= slider.max; i++) {
  //   const result = await slider.move(i);
  //   map[i] = result;
  // }

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();
