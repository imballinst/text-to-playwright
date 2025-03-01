import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

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

  console.info(await page.getByRole('textbox', { name: 'Base damage' }).inputValue());

  // TODO: shadcn's one was tough
  const label = 'Crit chance slider native';
  const slider = page.locator('span[data-slot=slider]', { has: page.locator('span[data-slot=slider-thumb]').first() }).first();
  // const label = 'Crit chance slider native';
  // const slider = page.getByRole('slider', { name: label }).first();
  let sliderValue = await slider.getAttribute('value');

  const getSliderStuff = async () => {
    const bb = (await slider.boundingBox())!;
    console.info(bb);

    const bbX = bb.x + (bb.width * Number(sliderValue)) / 100;
    const bbY = (bb.y + bb.height) / 2;
    const targetX = bb.x + (bb.width * 100) / 100;

    return { bb, bbX, bbY, targetX };
  };

  let sliderStuff = await getSliderStuff();
  console.info('initial', sliderValue, sliderStuff.bbX);

  const bbY = sliderStuff.bbY;
  let bbX = sliderStuff.bbX;
  let targetX = sliderStuff.targetX;

  // await slider.click({ position: { x: (sliderStuff.bb.width * 70) / sliderStuff.bb.width, y: sliderStuff.bb.height / 2 } });
  await slider.hover();
  await page.mouse.down();
  await slider.hover();
  await page.mouse.move(targetX, bbY);
  await page.mouse.up();

  sliderValue = await page.getByRole('slider', { name: label }).first().getAttribute('value');
  sliderStuff = await getSliderStuff();
  bbX = sliderStuff.bbX;
  targetX = sliderStuff.targetX;
  console.info('next', sliderValue, bbX, targetX);

  await page.getByRole('textbox', { name: 'Critical hit chance' }).first().fill('80');
  sliderValue = await page.getByRole('slider', { name: label }).first().getAttribute('value');
  console.info('after manual fill', sliderValue, bbX, targetX);

  sliderStuff = await getSliderStuff();
  bbX = sliderStuff.bbX;
  targetX = sliderStuff.targetX;

  await slider.click();
  console.info('after another click', sliderValue, bbX, targetX);

  sliderStuff = await getSliderStuff();
  bbX = sliderStuff.bbX;
  targetX = sliderStuff.targetX;

  console.info(sliderValue, bbX, targetX);
  console.info('ye 2');

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();
