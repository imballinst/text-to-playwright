# text-to-playwright

[![build](https://github.com/imballinst/text-to-playwright/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/imballinst/text-to-playwright/actions/workflows/build.yaml)

![NPM Version](https://img.shields.io/npm/v/text-to-playwright)

`text-to-playwright` is a library that helps you write tests that is _kinda_ written with human language and converts it to Playwright cases. Behind the scenes, instead of using `@playwright/test`, this library is using the `chromium` to open the web page and use [Locator object](https://playwright.dev/docs/api/class-locator) for the assertions.

## Requirements

- Node.js 20+

## Installation

```sh
npm i --save-dev text-to-playwright

# Or yarn:
# yarn add -D text-to-playwright
```

## Getting started

Write a YAML file, something like the following. Why YAML? Because it's more human-friendly than JSON (and less noisy as well, where with JSON we need curly braces and quotes).

```yaml
# tests/meter.yaml
tests:
  - name: Example test case
    steps:
      - Ensure "Result" element to contain text "Your DPS is 1100".
      - command: Slide "Crit chance slider shadcn" slider to value "100".
        sliderSelector: shadcn
      - Ensure "Result" element to contain text "Your DPS is 1500".
      - Slide "Crit chance slider native" slider to value "50".
      - Ensure "Result" element to contain text "Your DPS is 1250".
      # TODO: test other stuff.
      - Fill "Base damage" input with value "-1".
      - Ensure "Base damage" input to have error message "Base damage should be a positive number".
      - Fill "Base damage" input with value "xdd".
      - Ensure "Base damage" input to have error message "Base damage should be a number".
      # Validate attack per second.
      - Fill "Attacks per second" input with value "-1".
      - Ensure "Attacks per second" input to have error message "Attacks per second should be a positive number".
      - Fill "Attacks per second" input with value "xdd".
      - Ensure "Attacks per second" input to have error message "Attacks per second should be a number".
      # Validate crit chance.
      - Fill "Critical hit chance" input with value "-1".
      - Ensure "Critical hit chance" input to have error message "Critical hit chance should be a positive number".
      - Fill "Critical hit chance" input with value "xdd".
      - Ensure "Critical hit chance" input to have error message "Critical hit chance should be a number".
      # Validate crit damage.
      - Fill "Critical hit damage" input with value "-1".
      - Ensure "Critical hit damage" input to have error message "Critical hit damage should be a positive number".
      - Fill "Critical hit damage" input with value "101".
      - Ensure "Critical hit damage" input to have error message "Critical hit damage should not be bigger than 100 (percent)".
      - Fill "Critical hit damage" input with value "xdd".
      - Ensure "Critical hit damage" input to have error message "Critical hit damage should be a number".
```

The YAML above means there is 1 test case and the test case contains a number of steps. After that, run the following command.

```sh
# First argument is path to the test file, second argument is the website URL.
npx text-to-playwright tests/meter.yaml https://imballinst.github.io/text-to-playwright/meter/

# Or yarn:
# yarn text-to-playwright tests/meter.yaml https://imballinst.github.io/text-to-playwright/meter/
```

It will output the following.

```
Example test case
  Step 1: Click "Teams" link, then click "Submit" button.
  Step 2: Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".
  Step 3: Click "Submit" button on the Real Users Section.
  Step 4: Ensure "Real output" element on the Real Users Section to have value "123".
  Step 5: Store the value of "Real output" element on the Real Users Section to variable {hello}.
  Step 6: Ensure "Real output" element on the Real Users Section to have value {hello}.
  Step 7: Click "Users" link, then fill "User ID" input on the Real Users Section with value "Mr. 123".
  Step 8: Click "Submit" button on the Real Users Section.
  Step 9: Ensure "Real output" element on the Real Users Section to have value "Mr. 123".
  Step 10: Ensure "Real output" element on the Real Users Section not to have value "Ms. 123".
  Step 11: Ensure "Real output" element on the Real Users Section to match pattern "/\d{3}/".
  Step 12: Ensure "Real output" element on the Real Users Section to match pattern "/Mr\. \d{3}/".
Test hover
  Step 1: Click "Users" link.
  Step 2: Hover "User ID" input on the Real Users Section.
  Step 3: Ensure "User ID" input on the Real Users Section to have accessible description "The user ID does not have any requirements.".
✅ All tests completed!
```

You can see real examples in the [examples](./examples/) folder.

## How it works

This is _not_ using Artificial Intelligence (AI). Why? Because despite we have seen amazing progress in the AI aspect these days, we can't say it is "accessible" yet, especially to run it in our local optimally. As such, this library uses only _basic_ Natural Language Processing (NLP) to parse the sentences (check out [compromise](https://github.com/spencermountain/compromise/), it's super cool).

For some weird cases here a word may be a Verb or Noun, the library is using a bit of "hack" by forcing the chunk to be the intended one based on the word's position on the sentence.

## Development

### Development Requirements

- Yarn berry 4.5.1+
- Corepack

### Scripts cheatsheet

There are 3 commands that are useful for development:

1. `corepack enable` -- this will fetch the Yarn version to your machine, so we don't have to store binary in the repository.
1. `yarn` -- install dependencies like usual.
1. `yarn test` -- run the test cases.
1. `yarn dev` -- run the example test file, imitating end-to-end flow.

## License

MIT
