# text-to-playwright

`text-to-playwright` is a library that helps you write tests that is _kinda_ written with human language and converts it to Playwright cases. Behind the scenes, instead of using `@playwright/test`, this library is using the `chromium` to open the web page and use [Locator object](https://playwright.dev/docs/api/class-locator) for the assertions.

**WARNING: at the moment, this library has not been published yet.**

## Requirements

- Node.js 18+
- Yarn berry

## Development

There are 3 commands that are useful for development:

1. `yarn` -- install dependencies like usual.
2. `yarn test` -- run the test cases.
3. `yarn dev` -- run the example test file, imitating end-to-end flow.

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
```

The YAML above means there is 1 test case and the test case contains 4 steps. The library will then do the rest.

## How it works

This is _not_ using Artificial Intelligence (AI). Why? Because despite we have seen amazing progress in the AI aspect these days, we can't say it is "accessible" yet, especially to run it in our local optimally. As such, this library uses only _basic_ Natural Language Processing (NLP) to parse the sentences (check out [compromise](https://github.com/spencermountain/compromise/), it's super cool).

For some weird cases here a word may be a Verb or Noun, the library is using a bit of "hack" by forcing the chunk to be the intended one based on the word's position on the sentence.
