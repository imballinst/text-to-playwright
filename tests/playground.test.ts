import test, { expect } from '@playwright/test';

test('Page Screenshot', async ({ page }) => {
  await page.goto(`http://localhost:5173/template-crud/`);

  await expect(page.getByText('Existing templates')).toBeVisible();

  await page.getByRole('button', { name: 'Create template' }).click();

  console.info(
    await page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Create template' }) })
      .getByRole('button', { name: 'Create template' })
      .first()
      .innerHTML()
  );

  // console.info('hehe 1', await page.getByRole('textbox', { name: 'Template name' }).inputValue());
  // await page.getByRole('textbox', { name: 'Template name' }).fill('hehe');
  // console.info('hehe 2', await page.getByRole('textbox', { name: 'Template name' }).inputValue());

  // const loc = page.locator('form').filter({ has: page.getByRole('button', { name: 'Create template' }) });
  // await loc.getByRole('button', { name: 'Create template' }).click();

  // await page.getByRole('button', { name: 'Edit hehe' }).click();

  // console.info('hehe 1', await page.getByRole('textbox', { name: 'Template name' }).inputValue());
  // await page.getByRole('textbox', { name: 'Template name' }).fill('');
  // console.info('hehe 2', await page.getByRole('textbox', { name: 'Template name' }).inputValue());
});
