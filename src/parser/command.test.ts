import { describe, expect, test } from 'vitest';
import { parse, parseSentence } from './command';

test('parseSentence', () => {
  let parsed = parseSentence('Click "Teams" link');
  expect(parsed.length).toBe(1);

  parsed = parseSentence('Click "Teams" link, then click "Submit" button.');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Click "Teams" link. then click "Submit" button.');
  expect(parsed.length).toBe(2);

  parsed = parseSentence('Click "Teams" link\n then click "Submit" button.');
  expect(parsed.length).toBe(2);
});

describe('Click', () => {
  test('Objects with 1 word', () => {
    let result = parse('Click "Users" link');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'link',
      object: 'Users'
    });

    result = parse('Click "Submit" button');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Submit'
    });
  });

  test('Objects with more than 1 word', () => {
    let result = parse('Click "Create User" button');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User'
    });

    result = parse('Click "Click me" button');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Click me'
    });
  });

  test('Objects with specifiers', () => {
    let result = parse('Click "Create User" button on the navbar');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'nav'
    });

    result = parse('Click "Create User" button on the Main Navigation');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'Main Navigation'
    });

    result = parse('Click "Create User" button on the Sidebar Navigation');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Create User',
      specifier: 'Sidebar Navigation'
    });
  });

  test('Edge cases objects and specifiers', () => {
    let result = parse('Click "Continue on studying" button');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Continue on studying'
    });

    result = parse('Click "Continue on studying" button on the navbar');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'click',
      elementType: 'button',
      object: 'Continue on studying',
      specifier: 'nav'
    });
  });
});

describe('Fill input', () => {
  test('Object with 1 word', () => {
    const result = parse('Fill "Name" input with value "Hello World"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Name',
      value: 'Hello World'
    });
  });

  test('Object with 2 words', () => {
    const result = parse('Fill "Display Name" input with value "Hello World"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      value: 'Hello World'
    });
  });

  test('Objects with specifiers', () => {
    const result = parse('Fill "Display Name" input on the User section with value "Hello World"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'fill',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User section',
      value: 'Hello World'
    });
  });
});

describe('Hover element', () => {
  test('Object with 1 word', () => {
    const result = parse('Hover "Name" input');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Name'
    });
  });

  test('Object with 2 words', () => {
    const result = parse('Hover "Display Name" input');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Display Name'
    });
  });

  test('Objects with specifiers', () => {
    const result = parse('Hover "Display Name" input on the User section');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'hover',
      elementType: 'textbox',
      object: 'Display Name',
      specifier: 'User section'
    });
  });
});

describe('Ensure value', () => {
  test('Object with 1 word', () => {
    let result = parse('Ensure "Name" input to have value "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Name',
      assertBehavior: 'exact',
      value: 'hello'
    });

    result = parse('Ensure "Result" element to contain text "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Result',
      assertBehavior: 'contain',
      value: 'hello'
    });
  });

  test('Object with 2 words', () => {
    let result = parse('Ensure "Display Name" input to have value "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      value: 'hello'
    });

    result = parse('Ensure "Expected Result" element to contain text "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      value: 'hello'
    });
  });

  test('Objects with specifiers', () => {
    let result = parse('Ensure "Display Name" input on the User section to have value "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'textbox',
      object: 'Display Name',
      assertBehavior: 'exact',
      value: 'hello',
      specifier: 'User section'
    });

    result = parse('Ensure "Expected Result" element on the User section to contain text "hello"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'ensure',
      elementType: 'generic',
      object: 'Expected Result',
      assertBehavior: 'contain',
      value: 'hello',
      specifier: 'User section'
    });
  });
});

describe('Store value', () => {
  test('Object with 1 word', () => {
    let result = parse('Store the value of "Name" input into variable "inputValue"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      variableName: 'inputValue'
    });

    result = parse('Store the value of "Name" input to variable "inputValue"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'store',
      elementType: 'textbox',
      object: 'Name',
      variableName: 'inputValue'
    });
  });
});
