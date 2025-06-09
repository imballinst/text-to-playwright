// @ts-check
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
const WORKSPACES_GLOB = PACKAGE_JSON.workspaces.packages;

const excludedWorkspaces = [];
let numPublishablePackages = 0;

for (const workspaceGlob of WORKSPACES_GLOB) {
  const indexBeforeGlob = workspaceGlob.indexOf('/*');
  const workspaceDir = workspaceGlob.slice(0, indexBeforeGlob);

  const workspacePath = path.join(process.cwd(), workspaceDir);
  const workspaceDirs = fs.readdirSync(workspacePath, {
    withFileTypes: true,
    encoding: 'utf-8'
  });

  for (const workspaceDir of workspaceDirs) {
    const packageJsonPath = path.join(workspacePath, workspaceDir.name, 'package.json');
    if (!fs.existsSync(packageJsonPath)) continue;

    const { name, version, private: isPackagePrivate } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (isPackagePrivate) {
      excludedWorkspaces.push(name);
      continue;
    }
    numPublishablePackages++;

    try {
      const output = execSync(`npm dist-tag ${name}`).toString();
      const latestTag = output.match(/latest: (\d+\.\d+\.\d+)/);

      if (latestTag && version === latestTag[1]) {
        excludedWorkspaces.push(name);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

if (numPublishablePackages !== excludedWorkspaces.length) {
  // If number of publishable packages is not equal to excluded packages,
  // then we run the release process.
  console.info(`Running: create .npmrc`);
  fs.writeFileSync(path.join(process.cwd(), '.npmrc'), `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`, 'utf-8');

  console.info(`Running: yarn workspaces foreach --exclude {${excludedWorkspaces.join(',')}} run build`);
  execSync(`yarn workspaces foreach --exclude {${excludedWorkspaces.join(',')}} run build`, { stdio: 'inherit' });

  console.info(`Running: yarn changeset publish`);
  execSync(`yarn changeset publish`, { stdio: 'inherit' });
} else {
  console.info('No packages to be published. Skipping process...');
}
