import axios from 'axios';
import { ChildProcess, spawn } from 'child_process';
import path from 'path';

const COMMON_SPAWN_OPTS = {
  stdio: 'inherit',
  env: process.env
} as const;

const processesToKill: ChildProcess[] = [];

process.once('uncaughtException', (e) => {
  console.error(e);
  cleanup();
});
process.once('SIGINT', (e) => {
  console.error(e);
  cleanup();
});

main();

export async function main() {
  const serverProcess = spawn('yarn', ['dev'], {
    cwd: path.join(process.cwd(), 'website'),
    detached: true,
    ...COMMON_SPAWN_OPTS
  });
  processesToKill.push(serverProcess);

  await waitUntil(async () => {
    try {
      await axios('http://localhost:5173');
      return true;
    } catch (err) {
      return false;
    }
  });

  await runUntilExit(() =>
    spawn('yarn', ['dev:meter'], {
      cwd: process.cwd(),
      detached: false,
      ...COMMON_SPAWN_OPTS
    })
  );

  await runUntilExit(() =>
    spawn('yarn', ['dev:template'], {
      cwd: process.cwd(),
      detached: false,
      ...COMMON_SPAWN_OPTS
    })
  );

  cleanup();
}

// Helper functions.
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

function cleanup() {
  for (const item of processesToKill) {
    if (!item.killed) {
      item.kill();
    }
  }
}

function runUntilExit(p: () => ChildProcess) {
  return new Promise((resolve, reject) => {
    const spawnedItem = p();
    spawnedItem.on('exit', () => {
      resolve(undefined);
    });

    spawnedItem.on('error', reject);
  });
}
