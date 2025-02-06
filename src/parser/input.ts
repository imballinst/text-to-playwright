import yaml from 'yaml';
import { z } from 'zod';

const TestCase = z.object({
  name: z.string(),
  steps: z.array(z.string())
});

const InputStructure = z.object({
  tests: z.array(TestCase)
});

export function parseInputTestFile(fileContent: string) {
  const parsed = yaml.parse(fileContent);

  return InputStructure.parse(parsed);
}
