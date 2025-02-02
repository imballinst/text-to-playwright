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
    const result = parse(
      'Fill "Display Name" input on the User section with value "Hello World"'
    );

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
