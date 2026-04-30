#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';

const LOG_FILE = path.join(process.cwd(), '.vercel-tmp', 'login.log');

function log(msg) {
  console.error(msg);
}

function commandExists(cmd) {
  try {
    if (isWindows) {
      const result = spawnSync('where', [cmd], { stdio: 'ignore' });
      return result.status === 0;
    } else {
      const result = spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' });
      return result.status === 0;
    }
  } catch {
    return false;
  }
}

function getCommandOutput(cmd, args) {
  try {
    const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows });
    return result.status === 0 ? (result.stdout || '').trim() : null;
  } catch {
    return null;
  }
}

function checkLoginStatus() {
  log('Checking login status...');
  try {
    const result = spawnSync('vercel', ['whoami'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: isWindows });
    const output = (result.stdout || '').trim();
    if (result.status === 0 && output && !output.includes('Error') && !output.includes('not logged in')) {
      log(`Logged in as: ${output}`);
      return true;
    }
  } catch {}
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startBackgroundLogin() {
  const logStream = fs.openSync(LOG_FILE, 'w');
  const child = spawn('vercel', ['login'], {
    detached: true,
    stdio: ['ignore', logStream, logStream],
    shell: isWindows
  });
  child.unref();
  log(`Background login process started (PID: ${child.pid})`);
  return child.pid;
}

async function waitForAuthUrl() {
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const match = content.match(/https:\/\/vercel\.com\/oauth\/device\?user_code=[A-Z0-9-]+(?=\s|$)/);
        if (match) {
          return match[0];
        }
      }
    } catch (e) {}
  }
  return null;
}

function openBrowser(url) {
  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      spawnSync('open', [url], { stdio: 'ignore' });
    } else if (platform === 'win32') {
      spawnSync('powershell', ['-Command', `Start-Process '${url}'`], { stdio: 'ignore', windowsHide: true });
    } else {
      spawnSync('xdg-open', [url], { stdio: 'ignore' });
    }
    log('Browser opened automatically');
  } catch (error) {
    log(`Failed to open browser: ${error.message}`);
  }
}

async function main() {
  log('========================================');
  log('Vercel CLI Login Authorization');
  log('========================================');
  log('');

  if (checkLoginStatus()) {
    log('Already logged in!');
    console.log(JSON.stringify({ status: 'already_logged_in' }));
    process.exit(0);
  }

  log('Starting login authorization...');
  const loginPid = startBackgroundLogin();
  log('Waiting for authorization URL...');

  const authUrl = await waitForAuthUrl();
  if (authUrl) {
    log('');
    log('========================================');
    log('Authorization URL extracted');
    log('Opening browser for authorization...');
    log('========================================');
    log('');
    openBrowser(authUrl);
    console.log(JSON.stringify({ status: 'needs_auth', auth_url: authUrl }));
  } else {
    log('Failed to get authorization URL');
    process.exit(1);
  }
}

main();
