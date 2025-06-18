import fs from 'fs/promises';
import path from 'path';

const TOKEN = '{APP_NAME}';
const PATH_TO_TEST_FILE = path.join(process.cwd(), `../website/src/examples/${TOKEN}/test.yaml`);
const PATH_TO_TARGET_FILE = path.join(process.cwd(), `tests/${TOKEN}.yaml`);
const APP_NAMES = ['meter', 'template-crud'];

await Promise.all(
  APP_NAMES.map((appName) => fs.cp(PATH_TO_TEST_FILE.replace(TOKEN, appName), PATH_TO_TARGET_FILE.replace(TOKEN, appName)))
);
