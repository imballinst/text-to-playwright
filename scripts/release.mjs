// @ts-check
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

const { name, version } = PACKAGE_JSON;
let shouldPublish = true;

try {
  const output = execSync(`npm dist-tag ${name}`).toString();
  const latestTag = output.match(/latest: (\d+\.\d+\.\d+)/);

  if (latestTag && version === latestTag[1]) {
    shouldPublish = false;
  }
} catch (err) {
  console.error(err);
}

if (shouldPublish) {
  // If number of publishable packages is not equal to excluded packages,
  // then we run the release process.
  console.info(`Running: create .npmrc`);
  fs.writeFileSync(path.join(process.cwd(), '.npmrc'), `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`, 'utf-8');

  console.info(`Running: yarn build`);
  execSync(`yarn run build`, { stdio: 'inherit' });

  console.info(`Running: yarn changeset publish`);
  execSync(`yarn changeset publish`, { stdio: 'inherit' });
} else {
  console.info('Package is up to date. Skipping process...');
}
