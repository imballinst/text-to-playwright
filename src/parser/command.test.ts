import { describe, expect, test } from 'vitest';
import { parse, parseSentence } from './command';

test('parseSentence', () => {
  let parsed = parseSentence('Click "Teams" link.');
  expect(parsed.length).toBe(1);

  parsed = parseSentence('Click "Teams" link, then click "Submit" button.');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Click "Teams" link. then click "Submit" button.');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Click "Teams" link\n then click "Submit" button.');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Click "Users" link, then fill "User ID" input on the Real Users Section with value "Mr. 123"');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Ensure "Real output" element on the Real Users Section to match pattern "/Mr\\. \\d{3}/".');
  expect(parsed.length).toBe(1);
});

describe('One-offs', () => {
  test('data-qa-id', () => {
    const result = parse('Click "users-real-section" link.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'link',
      object: 'users-real-section'
    });
  });
});

describe('Click', () => {
  test('Objects with 1 word', () => {
    let result = parse('Click "Users" link.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'link',
      object: 'Users'
    });

    result = parse('Click "Submit" button.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Submit'
    });
  });

  test('Objects with more than 1 word', () => {
    let result = parse('Click "Create User" button.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User'
    });

    result = parse('Click "Click me" button.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Click me'
    });
  });

  test('Objects with specifiers', () => {
    let result = parse('Click "Create User" button on the navbar.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'nav'
    });

    result = parse('Click "Create User" button on the Main Navigation.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'Main Navigation'
    });

    result = parse('Click "Create User" button on the Sidebar Navigation.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'Sidebar Navigation'
    });
  });

  test('Edge cases objects and specifiers', () => {
    let result = parse('Click "Continue on studying" button.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Continue on studying'
    });

    result = parse('Click "Continue on studying" button on the navbar.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'click',
      elementType: 'button',
      object: 'Continue on studying',
      specifier: 'nav'
    });
  });
});

describe('Fill input', () => {
  test('Empty input', () => {
    const result = parse('Fill "Name" input with value "".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Name',
      value: ''
    });
  });

  test('Object with 1 word', () => {
    const result = parse('Fill "Name" input with value "Hello World".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Name',
      value: 'Hello World'
    });
  });

  test('Object with 2 words', () => {
    const result = parse('Fill "Display Name" input with value "Hello World".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      value: 'Hello World'
    });
  });

  test('Objects with specifiers', () => {
    let result = parse('Fill "Display Name" input on the User section with value "Hello World".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User section',
      value: 'Hello World'
    });

    result = parse('Fill "Display Name" input on the "User" section with value "Hello World".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User',
      isSection: true,
      value: 'Hello World'
    });
  });

  test('Input with periods inside it', () => {
    const result = parse('Fill "Display Name" input on the User section with value "Hello. World".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User section',
      value: 'Hello. World'
    });
  });

  test('Numbers', () => {
    const expected = ['1', '10', '10000', '100.000', '100_000', '-1'];
    for (const value of expected) {
      const result = parse(`Fill "Display Name" input on the User section with value "${value}".`);

      expect(result.length).toBe(1);
      expect(result[0]).toStrictEqual({
        action: 'fill',
        elementType: 'textbox',
        object: 'Display Name',
        specifier: 'User section',
        value
      });
    }
  });
});

describe('Slide input', () => {
  test('Object with 1 word', () => {
    const result = parse('Slide "Crit" slider to value "80".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'slide',
      elementType: 'slider',
      object: 'Crit',
      value: '80'
    });
  });

  test('Object with 2 words', () => {
    const result = parse('Slide "Critical hit chance" slider to value "80".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'slide',
      elementType: 'slider',
      object: 'Critical hit chance',
      value: '80'
    });
  });

  test('Objects with specifiers', () => {
    const result = parse('Slide "Critical hit chance" slider on the User section to value "80".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'slide',
      elementType: 'slider',
      object: 'Critical hit chance',
      specifier: 'User section',
      value: '80'
    });
  });
});

describe('Hover element', () => {
  test('Object with 1 word', () => {
    const result = parse('Hover "Name" input.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Name'
    });
  });

  test('Object with 2 words', () => {
    const result = parse('Hover "Display Name" input.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Display Name'
    });
  });

  test('Objects with specifiers', () => {
    const result = parse('Hover "Display Name" input on the User section.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User section'
    });
  });
});

describe('Ensure value', () => {
  test('Existence', () => {
    let result = parse('Ensure "Create template" button to not exist.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'button',
      object: 'Create template',
      isNegativeAssertion: true,
      assertBehavior: 'exist'
    });

    result = parse('Ensure "Create template" button on the "Create template" section to not exist.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'button',
      object: 'Create template',
      isNegativeAssertion: true,
      isSection: true,
      specifier: 'Create template',
      assertBehavior: 'exist'
    });

    result = parse('Ensure "Create template" button on the Create template section to not exist.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'button',
      object: 'Create template',
      isNegativeAssertion: true,
      specifier: 'Create template section',
      assertBehavior: 'exist'
    });

    result = parse('Ensure "Create template" heading to not exist.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'heading',
      object: 'Create template',
      isNegativeAssertion: true,
      assertBehavior: 'exist'
    });
  });

  test('Object with 1 word', () => {
    let result = parse('Ensure "Name" input to have value "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Name',
      assertBehavior: 'exact',
      value: 'hello'
    });

    result = parse('Ensure "Result" element to contain text "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'contain',
      value: 'hello'
    });
  });

  test('Object with 2 words', () => {
    let result = parse('Ensure "Display Name" input to have value "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      value: 'hello'
    });

    result = parse('Ensure "Expected Result" element to contain text "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      value: 'hello'
    });
  });

  test('Objects with specifiers', () => {
    let result = parse('Ensure "Display Name" input on the User section to have value "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      value: 'hello',
      specifier: 'User section'
    });

    result = parse('Ensure "Expected Result" element on the User section to contain text "hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      value: 'hello',
      specifier: 'User section'
    });
  });

  test('Comparing value to variables', () => {
    let result = parse('Ensure "Display Name" input on the User section to have value {hello}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      specifier: 'User section',
      variableName: 'hello'
    });

    result = parse('Ensure "Expected Result" element on the User section to contain text {hello}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      specifier: 'User section',
      variableName: 'hello'
    });
  });

  test('Comparing value to pattern', () => {
    let result = parse('Ensure "Result" element to match pattern "/$\\d{4}/".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'match',
      value: '$\\d{4}'
    });

    result = parse('Ensure "Result" element to match pattern "/"Hello world"/".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'match',
      value: '"Hello world"'
    });

    result = parse('Ensure "Result" element to match pattern "/[abc]+/".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'match',
      value: '[abc]+'
    });

    result = parse('Ensure "Result" element to match pattern "/(abc)+\\/\\//".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'match',
      value: '(abc)+\\/\\/'
    });

    result = parse('Ensure "Result" element to match pattern "/Mr\\. \\d{3}/".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'match',
      value: 'Mr\\. \\d{3}'
    });
  });

  test('Negative assertions', () => {
    let result = parse('Ensure "Result" element to not match pattern "/$\\d{4}/".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      isNegativeAssertion: true,
      assertBehavior: 'match',
      value: '$\\d{4}'
    });

    result = parse('Ensure "Display Name" input on the User section to not have value "not hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      isNegativeAssertion: true,
      assertBehavior: 'exact',
      value: 'not hello',
      specifier: 'User section'
    });

    result = parse('Ensure "Expected Result" element on the User section to not contain text "not hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      isNegativeAssertion: true,
      assertBehavior: 'contain',
      value: 'not hello',
      specifier: 'User section'
    });

    // Test counter negative assertion.
    result = parse('Ensure "Display Name" input on the User section to have value "not hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      value: 'not hello',
      specifier: 'User section'
    });

    result = parse('Ensure "Expected Result" element on the User section to contain text "not hello".');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      value: 'not hello',
      specifier: 'User section'
    });
  });

  test('Accessible texts', () => {
    let result = parse(
      'Ensure "User ID" input on the Real Users Section to have accessible description "The user ID does not have any requirements."'
    );

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'User ID',
      specifier: 'Real Users Section',
      assertBehavior: 'exact',
      valueBehavior: 'accessible',
      value: 'The user ID does not have any requirements.'
    });

    result = parse('Ensure "User ID" input on the Real Users Section to have error message "The user ID should not be empty."');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'User ID',
      specifier: 'Real Users Section',
      assertBehavior: 'exact',
      valueBehavior: 'error',
      value: 'The user ID should not be empty.'
    });
  });
});

describe('Store value', () => {
  test('Object with 1 word', () => {
    let result = parse('Store the value of "Name" input into variable {inputValue}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      variableName: 'inputValue'
    });

    result = parse('Store the value of "Name" input to variable {inputValue}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      variableName: 'inputValue'
    });
  });

  test('Object with specifiers', () => {
    let result = parse('Store the value of "Name" input on the User section into variable {inputValue}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      specifier: 'User section',
      variableName: 'inputValue'
    });

    result = parse('Store the value of "Name" input on the User section to variable {inputValue}.');

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      specifier: 'User section',
      variableName: 'inputValue'
    });
  });
});
