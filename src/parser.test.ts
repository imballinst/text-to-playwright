import { describe, expect, test } from 'vitest';
import { parse } from './parser';

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
});

describe('Fill input', () => {
  test('Normal case', () => {
    const result = parse('Fill "Name" input with value "Hello World"');

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      action: 'fill',
      elementType: 'input',
      object: 'Name',
      value: 'Hello World'
    });
  });
});
