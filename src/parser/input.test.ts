import { describe, expect, test } from 'vitest';
import { parseInputTestFile } from './input';

describe('parseInputTestFile', () => {
  test('normal case', () => {
    const fileContent = `
tests:
  - name: Example test case
    steps:
      - Click "Users" menu, then click "Submit" button
      - Ensure "Output" element to contain text "hello"
    `.trim();

    const parsed = parseInputTestFile(fileContent);

    expect(parsed.tests.length).toBe(1);
    expect(parsed.tests[0].name).toBe("Example test case");
    expect(parsed.tests[0].steps.length).toBe(2);
    expect(parsed.tests[0].steps[0]).toBe(`Click "Users" menu, then click "Submit" button`);
    expect(parsed.tests[0].steps[1]).toBe(`Ensure "Output" element to contain text "hello"`);
  });

  test('with comments', () => {
    const fileContent = `
tests:
  # This is an example test case that will run under conditions A, B, C
  - name: Example test case
    steps:
      - Click "Users" menu, then click "Submit" button
      - Ensure "Output" element to contain text "hello"
    `.trim();

    const parsed = parseInputTestFile(fileContent);

    expect(parsed.tests.length).toBe(1);
    expect(parsed.tests[0].name).toBe("Example test case");
    expect(parsed.tests[0].steps.length).toBe(2);
    expect(parsed.tests[0].steps[0]).toBe(`Click "Users" menu, then click "Submit" button`);
    expect(parsed.tests[0].steps[1]).toBe(`Ensure "Output" element to contain text "hello"`);
  });
});
