import assert from "node:assert";
import { chromium } from "playwright";

interface TestAction {
  action: string;
}

interface TestExpectation {
  expect: string;
}

type MaybeAsyncFn<T = any> = (() => T) | (() => Promise<T>);

async function runPlaywrightExample() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://calculator.aws/#/");
  let title = await page.title();
  console.log(`Page title: ${title}`);

  const createEstimateButton = page.getByRole("button", {
    name: "Create Estimate",
  });
  await createEstimateButton.click();

  await waitFor(async () => {
    title = await page.title();
    assert.deepEqual(title, "Add service - AWS Pricing Calculator");
    console.log(`Page title: ${title}`);
  });

  await page.getByLabel("Choose a region").innerHTML();

  // TODO: update region type
  // TODO: ensure the Choose a region changed the label

  await browser.close();
}

async function waitFor(
  cb: MaybeAsyncFn,
  options?: {
    interval?: number;
    timeout?: number;
  }
) {
  const interval = options?.interval ?? 1000;
  let timeout = options?.timeout ?? 10_000;
  let isPassed = false;

  while (!isPassed) {
    if (timeout < 0) throw new Error("");

    isPassed = await new Promise((res) => {
      setTimeout(async () => {
        try {
          await cb();
          res(true);
        } catch (err) {
          res(false);
        }
      }, interval);
    });

    timeout -= interval;
  }
}

runPlaywrightExample();
