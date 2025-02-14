# text-to-playwright

`text-to-playwright` is a library that helps you write tests that is _kinda_ written with human language and converts it to Playwright cases. Behind the scenes, instead of using `@playwright/test`, this library is using the `chromium` to open the web page and use [Locator object](https://playwright.dev/docs/api/class-locator) for the assertions.

**WARNING: at the moment, this library has not been published yet.**

## Requirements

- Node.js 20+
- Yarn berry 4.5.1+
- Corepack

## Development

There are 3 commands that are useful for development:

1. `corepack enable` -- this will fetch the Yarn version to your machine, so we don't have to store binary in the repository.
1. `yarn` -- install dependencies like usual.
1. `yarn test` -- run the test cases.
1. `yarn dev` -- run the example test file, imitating end-to-end flow.

## Getting started

Write a YAML file, something like the following. Why YAML? Because it's more human-friendly than JSON (and less noisy as well, where with JSON we need curly braces and quotes).

```yaml
tests:
  - name: Example test case
    steps:
      - Click "Teams" link, then click "Submit" button.
      - Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".
      - Click "Submit" button on the Real Users Section.
      - Ensure "Real output" element on the Real Users Section to have value "123".
      - Store the value of "Real output" element on the Real Users Section to variable {hello}.
      - Ensure "Real output" element on the Real Users Section to have value {hello}.
```

The YAML above means there is 1 test case and the test case contains a number of steps. The library will then do the rest, which it will do the following.

```
Example test case
  Step 1: Click "Teams" link, then click "Submit" button.
    await page.getByRole("link", { name: "Teams" }).first().toBeVisible()
    await page.getByRole("link", { name: "Teams" }).first().click()
    await page.getByRole("button", { name: "Submit" }).first().toBeVisible()
    await page.getByRole("button", { name: "Submit" }).first().click()
  Step 2: Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".
    await page.getByRole("link", { name: "Users" }).first().toBeVisible()
    await page.getByRole("link", { name: "Users" }).first().click()
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByRole("textbox", { name: "User ID" }).first().toBeVisible()
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByRole("textbox", { name: "User ID" }).first().fill("123")
  Step 3: Click "Submit" button on the Real Users Section.
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByRole("button", { name: "Submit" }).first().toBeVisible()
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByRole("button", { name: "Submit" }).first().click()
  Step 4: Ensure "Real output" element on the Real Users Section to have value "123".
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByLabel("Real output").first().toBeVisible()
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByLabel("Real output").first().toHaveText("123")
  Step 5: Store the value of "Real output" element on the Real Users Section to variable {hello}.
    let hello = await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByLabel("Real output").first().innerText()
  Step 6: Ensure "Real output" element on the Real Users Section to have value {hello}.
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByLabel("Real output").first().toBeVisible()
    await page.locator("section", { has: page.getByRole("heading", { name: "Real Users Section" }) }).getByLabel("Real output").first().toHaveText(hello)
✅ All tests completed!
```

## How it works

This is _not_ using Artificial Intelligence (AI). Why? Because despite we have seen amazing progress in the AI aspect these days, we can't say it is "accessible" yet, especially to run it in our local optimally. As such, this library uses only _basic_ Natural Language Processing (NLP) to parse the sentences (check out [compromise](https://github.com/spencermountain/compromise/), it's super cool).

For some weird cases here a word may be a Verb or Noun, the library is using a bit of "hack" by forcing the chunk to be the intended one based on the word's position on the sentence.
