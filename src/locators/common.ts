import { Locator, Page } from '@playwright/test';
import { Selector } from '../parser/input';
import { AriaRole } from '../types/aria';

export function getLocator(page: Page | Locator, elementType: AriaRole, name: string, selector: Selector, opts?: { specifier?: string }) {
  if (selector === 'data-qa-id' || selector === 'id') {
    return page.locator(`[${selector}=${name}]`);
  }

  const { specifier } = opts ?? {};
  let locator: Locator;

  if (specifier) {
    if (/section/i.test(specifier)) {
      locator = page.locator('section', {
        has: page.getByRole('heading', { name: specifier })
      });

      locator = getLocatorByElementType(locator, elementType, name);
    } else {
      locator = page.getByLabel(specifier).getByRole(elementType, { name }).first();
    }
  } else {
    locator = getLocatorByElementType(page, elementType, name);
  }

  return locator;
}

// Helper functions.
function getLocatorByElementType(locator: Page | Locator, elementType: AriaRole, name: string) {
  if (elementType === 'generic') {
    // If generic, we can't really use `getByRole`, so we need to use `getByLabel`.
    return locator.getByLabel(name).first();
  }

  return locator.getByRole(elementType, { name }).first();
}
