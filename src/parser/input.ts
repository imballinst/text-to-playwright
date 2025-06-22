import yaml from 'yaml';
import { z } from 'zod/v4';

export const Selector = z.union([z.literal('label'), z.literal('data-qa-id'), z.literal('id')]);
export type Selector = z.infer<typeof Selector>;

export const SliderType = z.union([z.literal('native'), z.literal('shadcn')]);
export type SliderType = z.infer<typeof Selector>;

export const SharedFields = z.object({
  selector: Selector.optional(),
  sliderSelector: SliderType.optional()
});
export interface SharedFields extends z.infer<typeof SharedFields> {}

const StepCommand = z.object({
  ...SharedFields.shape,
  command: z.string()
});
const StepWaitForURL = z.object({
  waitForURL: z.string(),
  pageTitle: z.string().optional()
});

const Step = z.transform((input) => {
  if (typeof input === 'string') return input;

  const result = StepCommand.safeParse(input);
  if (result.success)
    return {
      kind: 'command',
      ...result.data
    } as const;

  const waitForURLResult = StepWaitForURL.parse(input);
  return {
    kind: 'waitForURL',
    ...waitForURLResult
  } as const;
});
export type Step = z.infer<typeof Step>;

const TestCase = SharedFields.merge(
  z.object({
    name: z.string(),
    steps: z.array(Step)
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
