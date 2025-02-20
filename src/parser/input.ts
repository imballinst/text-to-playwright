import yaml from 'yaml';
import { z } from 'zod';

export const Selector = z.union([z.literal('label'), z.literal('data-qa-id')]);

const TestCase = z.object({
  name: z.string(),
  selector: Selector.optional(),
  steps: z.array(z.string())
});

const InputStructure = z.object({
  selector: Selector.optional(),
  tests: z.array(TestCase)
});
export interface InputStructure extends z.infer<typeof InputStructure> {}

export function parseInputTestFile(fileContent: string): InputStructure {
  const parsed = yaml.parse(fileContent);

  return InputStructure.parse(parsed);
}
