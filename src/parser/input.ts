import yaml from 'yaml';
import { z } from 'zod';

export const Selector = z.union([z.literal('label'), z.literal('data-qa-id')]);
export type Selector = z.infer<typeof Selector>;

export const SliderType = z.union([z.literal('native'), z.literal('shadcn')]);
export type SliderType = z.infer<typeof Selector>;

const SharedFields = z.object({
  selector: Selector.optional(),
  sliderSelector: SliderType.optional()
});

const TestCase = SharedFields.merge(
  z.object({
    name: z.string(),
    steps: z.array(z.string())
  })
);

const InputStructure = SharedFields.merge(
  z.object({
    tests: z.array(TestCase)
  })
);
export interface InputStructure extends z.infer<typeof InputStructure> {}

export function parseInputTestFile(fileContent: string): InputStructure {
  const parsed = yaml.parse(fileContent);

  return InputStructure.parse(parsed);
}
