import { GitHubIcon } from '@/components/icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { Textarea } from '@/components/ui/textarea';
import debounce from 'lodash/debounce';
import { Moon, Sun } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { ZodError, z } from 'zod/v4';
import { parseInputTestFile } from '../../src/parser/input';
import './app.css';

const DEFAULT_TEST_CASE: string = (import.meta.env.VITE_YAML_CONTENT ?? '').trim();
const LIST_OF_APPS: string[][] = ((import.meta.env.VITE_APP_INPUTS ?? '').split(';') as string[]).map((item) => item.split(','));

console.info(import.meta.env.VITE_APP_INPUTS);

type TextParseOutput =
  | { errors: null }
  | { errors: z.core.$ZodIssue[]; type: 'zod' }
  | { errors: [string]; type: 'normal' }
  | { errors: [string]; type: 'unknown' };

export function App() {
  const [output, setOutput] = useState<TextParseOutput | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setOutput(getOutput(DEFAULT_TEST_CASE));
  }, []);

  const syncInputText = useCallback(
    debounce(function sync(e: ChangeEvent<HTMLTextAreaElement>) {
      setOutput(getOutput(e.target.value));
    }, 1000),
    []
  );

  return (
    <>
      <nav className="px-6 py-2 border-b border-b-border flex justify-between items-center sticky top-0 bg-background/90">
        <div className="flex gap-x-2">
          <div className="flex items-center">text-to-playwright</div>

          <div className="ml-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {LIST_OF_APPS.map(([key, value]) => (
                      <NavigationMenuLink key={key} className="min-w-[125px]" href={`${import.meta.env.VITE_BASE_PATH}/${key}/`}>
                        {value}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <a href="https://github.com/imballinst/text-to-playwright" target="_blank" rel="noreferrer" aria-label="GitHub repository">
            <GitHubIcon className="w-4 fill-accent-foreground" />
          </a>

          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer border-0"
            onClick={() => {
              setTheme(theme === 'light' ? 'dark' : 'light');
            }}
          >
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />

            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>

      <main className="bg-background grid md:grid-cols-5 grid-cols-1 gap-8 px-6 py-4 flex-1">
        <section className="flex flex-col md:col-span-2">
          <h2 className="font-bold mb-4">Input</h2>

          <div className="flex flex-col flex-1">
            <Label htmlFor="test-file" className="sr-only">
              Test file content
            </Label>

            <Textarea
              id="test-file"
              className="flex flex-1 resize-none"
              placeholder="Input your test file content here..."
              defaultValue={DEFAULT_TEST_CASE}
              onChange={syncInputText}
            />
          </div>
        </section>

        <section className="flex flex-col md:col-span-3">
          <h2 className="font-bold mb-4">Output</h2>

          <pre className="p-2 break-words">{output?.errors ? JSON.stringify(output?.errors, null, 2) : 'All good, no errors! ✨'}</pre>
        </section>
      </main>
    </>
  );
}

function getOutput(testFile: string): TextParseOutput {
  try {
    parseInputTestFile(testFile);

    return { errors: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { type: 'zod', errors: err.issues };
    } else if (err instanceof Error) {
      return { type: 'normal', errors: [err.message] };
    }

    return { type: 'unknown', errors: ['unknown error'] };
  }
}
