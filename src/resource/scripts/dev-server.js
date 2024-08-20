import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import * as childProcess from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execSync = childProcess.execSync;

const relativeFilePath = '../.vscode/settings.json';
const absoluteFilePath = path.join(__dirname, relativeFilePath);

const args = process.argv.slice(2);

let sFlag = false;
args.forEach(arg => {
  if (arg === '-s') {
    sFlag = true;
  }
});

fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  let jsonData;
  try {
    jsonData = JSON.parse(data);
    if (jsonData) {
      const filesExclude = jsonData['files.exclude'];

      if (filesExclude) {
        let currentApps = Object.keys(filesExclude)
          .filter(filePath => !filesExclude[filePath] && filePath.includes('apps'))
          .map(filePath => filePath.replace('apps/', ''));

        if (sFlag) {
          currentApps.push('server');
        }

        const filterCommand = currentApps.reduce((acc, app) => acc + `--filter ${app} `, '');

        execSync(`turbo run dev ${filterCommand}`, {
          stdio: 'inherit'
        });
      }
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return;
  }
});
