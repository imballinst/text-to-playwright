import assert from "node:assert";
import { chromium } from "playwright";
import { expect } from "@playwright/test";
import { parse } from "./parser";

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

  await page.setContent(`
<html>
  <body>
    <nav>
      <ul>
        <li>
          <a href="#">Users</a>
        </li>
      </ul>
    </nav>
    
    <button>Create User</button>
  </body>
</html>
  `);

  // console.info(await page.innerHTML("body"));

  const parsed = parse('Click "Users" link, then click "Create User" button.');
  for (const command of parsed) {
    const { action, elementType, object } = command;

    if (action === "click") {
      const element = page.getByRole(elementType, { name: object });
      await expect(element).toBeVisible();
    }
  }

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
