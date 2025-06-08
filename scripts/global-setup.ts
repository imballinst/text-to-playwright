import axios from 'axios';
import { ChildProcess, spawn } from 'child_process';
import path from 'path';

let teardownHappened = false;
let serverProcess: ChildProcess | undefined;

export async function setup() {
  serverProcess = spawn('yarn', ['dev'], {
    cwd: path.join(process.cwd(), 'website'),
    stdio: 'inherit',
    detached: true,
    env: process.env
  });

  await waitUntil(async () => {
    try {
      await axios('http://localhost:5173');
      return true;
    } catch (err) {
      return false;
    }
  });
}

export async function teardown() {
  if (teardownHappened) {
    throw new Error('teardown called twice');
  }
  teardownHappened = true;

  if (serverProcess) {
    serverProcess.kill();
  }

  await sleep(1000);
}

async function waitUntil(cb: () => Promise<boolean>) {
  while (true) {
    const shouldBreak = await cb();
    if (shouldBreak) break;

    await sleep(1000);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
