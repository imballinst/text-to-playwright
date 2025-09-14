import { GitHubIcon } from '@/components/icons';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { Moon, Sun } from 'lucide-react';

const LIST_OF_APPS = [
  ['meter', 'Meter'],
  ['template-crud', 'Template CRUD'],
  ['table', 'Table']
];
const BASE_PATH = '/';

export function AppNavbar() {
  const { theme, setTheme } = useTheme();

  return (
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
                    <NavigationMenuLink key={key} className="min-w-[125px]" href={`${BASE_PATH}${key}/`}>
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
  );
}
